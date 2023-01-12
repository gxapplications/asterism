import SunCalc from 'suncalc'

const dateToMinutesFromMidnight = (date) => {
  return date.getMinutes() + (60 * date.getHours())
}

class AstralData {
  constructor (latitude, longitude, altitude = 0) {
    this.latitude = latitude
    this.longitude = longitude
    this.altitude = altitude || 0
  }

  get todayDate () {
    const now = new Date()
    now.setUTCHours(0, 0, 0, 0)
    return now
  }

  getDatesSeries (stepInMinutes = 15, dayStart) {
    if (!dayStart) dayStart = this.todayDate
    if (stepInMinutes <= 0) stepInMinutes = 15
    const arraySize = 1440 / stepInMinutes
    return (new Array(arraySize)).fill(dayStart.getTime(), 0).map((dayStart, i) => new Date(dayStart + (i * stepInMinutes * 60000)))
  }

  // SUN

  getNightEndTime () {
    return SunCalc.getTimes(this.todayDate, this.latitude, this.longitude, this.altitude).nightEnd
  }

  getSunRiseTime () {
    return SunCalc.getTimes(this.todayDate, this.latitude, this.longitude, this.altitude).sunrise
  }

  getSolarNoonTime () {
    return SunCalc.getTimes(this.todayDate, this.latitude, this.longitude, this.altitude).solarNoon
  }

  getMaxSunAltitude () {
    return this.getSunAltitude(SunCalc.getTimes(this.todayDate, this.latitude, this.longitude, this.altitude).solarNoon)
  }

  getSunsetTime () {
    return SunCalc.getTimes(this.todayDate, this.latitude, this.longitude, this.altitude).sunset
  }

  getNightTime () {
    return SunCalc.getTimes(this.todayDate, this.latitude, this.longitude, this.altitude).night
  }

  getSunAltitude (dateTime) {
    return SunCalc.getPosition(dateTime, this.latitude, this.longitude).altitude
  }

  /**
   * normalizationRate will allow a mixed rate between real sun max illumination (that changes over seasons) and a constant maximum illumination.
   * 0 will use real sun altitude. Illumination will be lower during cold seasons.
   * 1 will normalize to have always 100% as result when sun is at maximum altitude for the day.
   *
   * @param dateTime
   * @param normalizationRate {number} float [0-1]: 0 for illumination totally proportional to sun maximum altitude of the day, 1 for constant max illumination.
   * @returns {number} 1 for maximum sun illumination, 0 during the night
   */
  getSunIlluminationRate (dateTime, normalizationRate = 0) {
    const maxAltitude = this.getMaxSunAltitude() || 0.001
    const currentAltitude = this.getSunAltitude(dateTime)
    const mixedMaxAltitude = (1 - normalizationRate) + (normalizationRate * maxAltitude)
    if (currentAltitude <= 0) return 0
    return currentAltitude / mixedMaxAltitude // 1 for max sun altitude of the day
  }

  // MOON

  getMoonAltitude (dateTime) {
    return SunCalc.getMoonPosition(dateTime, this.latitude, this.longitude).altitude
  }

  getMoonFraction (dateTime) {
    return SunCalc.getMoonIllumination(dateTime).fraction
  }

  getMoonIlluminationRate (dateTime, useFraction = true) {
    const enlighteningAltitude = this.getMoonAltitude(dateTime) - (Math.PI / 16)
    const fraction = useFraction ? this.getMoonFraction(dateTime) : 1
    return Math.max(0, fraction * (enlighteningAltitude / (Math.PI / 2)))
  }

  // Laplace - Gauss
  normale (x, variance = 0, ecartType = 0.4) {
    const expOf = - (x - variance) * (x - variance) / (2 * ecartType * ecartType)
    return (1 / (ecartType * Math.sqrt(2 * Math.PI))) * Math.exp(expOf)
  }

  // LIGHTS

  getRedLight (dateTime, maxRedRatio, minRedRatio, normalizationRate) {
    // from sun illumination rules
    const maxAltitude = this.getMaxSunAltitude() || 0.001
    const mixedMaxAltitude = (1 - normalizationRate) + (normalizationRate * maxAltitude)

    // timing
    const time = dateTime.getTime()
    const sunrise = this.getSunRiseTime().getTime()
    const noon = this.getSolarNoonTime().getTime()
    const sunset = this.getSunsetTime().getTime()

    if (time <= sunrise) {
      const gap = sunrise - this.getNightEndTime().getTime()
      const variance = sunrise / gap
      const x = time / gap
      return this.normale(x, variance) * maxRedRatio * mixedMaxAltitude
    }
    if (time <= noon) {
      const gap = (noon - sunrise) * (maxRedRatio - minRedRatio)
      const variance = sunrise / gap
      const x = time / gap
      return (minRedRatio * mixedMaxAltitude) + this.normale(x, variance) * (maxRedRatio - minRedRatio) * mixedMaxAltitude
    }

    if (time <= sunset) {
      const gap = (sunset - noon) * (maxRedRatio - minRedRatio)
      const variance = sunset / gap
      const x = time / gap
      return (minRedRatio * mixedMaxAltitude) + this.normale(x, variance) * (maxRedRatio - minRedRatio) * mixedMaxAltitude
    }

    const gap = this.getNightTime() - sunset
    const variance = sunset / gap
    const x = time / gap
    return this.normale(x, variance) * maxRedRatio * mixedMaxAltitude
  }

  getBlueLight (dateTime, useMoonFraction = true, minBlueRate = 0) {
    return Math.max(minBlueRate, this.getMoonIlluminationRate(dateTime, useMoonFraction))
  }

  getLights (dateTime, {
    maxRedRatio,
    minRedRatio,
    useMoonFraction,
    minBlueRate,
    normalizationRate,
    redMainFactor = 1,
    whiteMainFactor = 1,
    blueMainFactor = 1,
  }) {
    // from sun illumination rules
    const maxAltitude = this.getMaxSunAltitude() || 0.001
    const mixedMaxAltitude = (1 - normalizationRate) + (normalizationRate * maxAltitude)

    const red = this.getRedLight(dateTime, maxRedRatio, minRedRatio, normalizationRate)
    const blue = this.getBlueLight(dateTime, useMoonFraction, minBlueRate)
    const sunIllumination = this.getSunIlluminationRate(dateTime, normalizationRate)
    const white = (sunIllumination <= 0) ? 0 : (sunIllumination - red + (maxRedRatio * mixedMaxAltitude))
    return {
      red: Math.min(1, red * redMainFactor),
      blue: Math.min(1, blue * blueMainFactor),
      white: Math.min(1, white * whiteMainFactor),
    }
  }
}


export default AstralData