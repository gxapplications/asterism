'use strict'

import { CronJob } from 'cron'
import { exec } from 'child_process'
import debounce from 'debounce'

export default class MonitorScenariiService {
  constructor ({ getServices, logger, dataHandler, notificationHandler, privateSocket, publicSockets }) {
    this.scenariiService = getServices()['asterism-scenarii']
    this.logger = logger

    if (!this.scenariiService) {
      return // do not register scenarii dependant components if not activated
    }

    this.cronDbBackup = new CronJob(
      '20 56 1 * * 1,4', // each mondays & thursdays, 1:56:20
      this.backupDb,
      null, true, 'Europe/Paris', this
    )

    this.cronRaspberryTemp = new CronJob(
      '45 * * * * *', // each minute, 45s
      this.raspberryTemp,
      null, true, undefined, this
    )
    this.raspberryTempErrors = 0
    this.debouncerRaspberryTempWarning = debounce((temp) => {
      // TODO !0: send notification: temp too high
    }, 15*60000, true)

    setTimeout((() => {
      this.cronCpuLoad = new CronJob(
          '*/30 * * * * *', // each 30s
          this.cpuLoad,
          null, true, undefined, this
      )
    }).bind(this), 5*60000)
    this.cpuLoadErrors = 0
    this.cpuLoads = []
    this.debouncerCpuLoadWarning = debounce((mean) => {
      // TODO !0: send notification: cpu load too high
    }, 5*60000, true)
  }

  backupDb () {
    this.logger.log('Monitor:DbBackup...', new Date().toString())
    // TODO !0: faire un backup. fichier 20221231-235959.tgz dans var/backups/
    //  puis suppr les backups plus anciens que 2 mois, ou si plus de 20 backups.

  }

  raspberryTemp () {
    exec(
      'cat /sys/class/thermal/thermal_zone0/temp',
      (err, stdout, stderr) => {
        if (err || stderr) {
          this.raspberryTempErrors++
          if (this.raspberryTempErrors > 5) {
            this.logger.warn('RaspberryTemp monitor failed 5 times. Monitor canceled!')
            this?.cronRaspberryTemp?.stop()
          }
          return
        }
        try {
          const temperature = Math.trunc(Number.parseInt(stdout, 10) / 1000)
          if (temperature > 45) {
            this.logger.warn(`Monitor/raspberryTemp: ${temperature} is high. Sending notification...`);
            this.debouncerRaspberryTempWarning(temperature)
          }
          if (temperature > 55) {
            this.logger.error(`Monitor/raspberryTemp: ${temperature} is too high. Rebooting node process...`);
            // TODO !0: reboot requis d'urgence
          }
        } catch(err2) {
          this.logger.error(err2)
        }
      }
    )
  }

  cpuLoad () {
    exec(
      'pm2 jlist',
      (err, stdout, stderr) => {
        if (err || stderr) {
          this.cpuLoadErrors++
          if (this.cpuLoadErrors > 5) {
            this.logger.warn('CpuLoad monitor failed 5 times. Monitor canceled!')
            this?.cronCpuLoad?.stop()
          }
          return
        }
        try {
          const dump = JSON.parse(stdout)
          const cpus = dump.map((line) => ({ name: line.name, cpu: line.monit.cpu, memory: line.monit.memory }))
          const sum = cpus.reduce((acc, {cpu}) => acc + cpu , 0)
          this.cpuLoads.push(sum)
          while (this.cpuLoads.length > 30) {
            this.cpuLoads.splice(0, 1)
          }
          if (this.cpuLoads.length < 28) {
            return
          }
          const mean8 = this.cpuLoads.slice(-8).reduce((acc, v) => acc + v, 0) / 8
          const mean28 = this.cpuLoads.slice(-28).reduce((acc, v) => acc + v, 0) / 28

          if (mean8 > 80) {
            this.logger.warn(`Monitor/cpuLoad: CPU over 80% for 4 minutes. Sending notification...`)
            this.debouncerCpuLoadWarning(mean8)
          }
          if (mean28 > 90) {
            this.logger.warn(`Monitor/cpuLoad: CPU over 90% for 14 minutes. Rebooting node process...`)
            // TODO !0: reboot requis d'urgence
          }
        } catch (err2) {
          this.logger.error(err2)
        }
      }
    )

  }

  // TODO !1: monitor zwave key stability (toutes les 5 minutes) :
  //  > ls -la /dev/tty##### (ACM0 ou autre, selon la BDD) | wc -l
  //  les periphs doivent rester constants

  destroy () {
    this?.cronDbBackup?.stop()
    this?.cronRaspberryTemp?.stop()
    this?.cronCpuLoad?.stop()
  }
}
