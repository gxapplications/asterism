import SunCalc from 'suncalc'

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
    const day = dayStart ? new Date(dayStart) : this.todayDate
    day.setHours(0, 0, 0, 0)
    if (stepInMinutes <= 0) stepInMinutes = 15
    const arraySize = 1440 / stepInMinutes
    return (new Array(arraySize)).fill(day.getTime(), 0).map((day, i) => new Date(day + (i * stepInMinutes * 60000)))
  }

  // SUN

  getNightEndTime (date) {
    return SunCalc.getTimes(date || this.todayDate, this.latitude, this.longitude, this.altitude).nightEnd
  }

  getSunRiseTime (date) {
    return SunCalc.getTimes(date || this.todayDate, this.latitude, this.longitude, this.altitude).sunrise
  }

  getSolarNoonTime (date) {
    return SunCalc.getTimes(date || this.todayDate, this.latitude, this.longitude, this.altitude).solarNoon
  }

  getMaxSunAltitude (date) {
    return this.getSunAltitude(SunCalc.getTimes(date || this.todayDate, this.latitude, this.longitude, this.altitude).solarNoon)
  }

  getSunsetTime (date) {
    return SunCalc.getTimes(date || this.todayDate, this.latitude, this.longitude, this.altitude).sunset
  }

  getNightTime (date) {
    return SunCalc.getTimes(date || this.todayDate, this.latitude, this.longitude, this.altitude).night
  }

  getSunAltitude (dateTime) {
    return SunCalc.getPosition(dateTime, this.latitude, this.longitude).altitude
  }

  /**
   * sunNormalizationRate will allow a mixed rate between real sun max illumination (that changes over seasons) and a constant maximum illumination.
   * 0 will use real sun altitude. Illumination will be lower during cold seasons.
   * 1 will normalize to have always 100% as result when sun is at maximum altitude for the day.
   *
   * @param dateTime
   * @param sunNormalizationRate {number} float [0-1]: 0 for illumination totally proportional to sun maximum altitude of the day, 1 for constant max illumination.
   * @returns {number} 1 for maximum sun illumination, 0 during the night
   */
  getSunIlluminationRate (dateTime, sunNormalizationRate = 0) {
    const maxAltitude = this.getMaxSunAltitude(dateTime) || 0.001
    const currentAltitude = this.getSunAltitude(dateTime)
    const mixedMaxAltitude = (1 - sunNormalizationRate) + (sunNormalizationRate * maxAltitude)
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

  getRedLight (dateTime, maxRedRatio, minRedRatio, sunNormalizationRate) {
    // from sun illumination rules
    const maxAltitude = this.getMaxSunAltitude(dateTime) || 0.001
    const mixedMaxAltitude = (1 - sunNormalizationRate) + (sunNormalizationRate * maxAltitude)

    // timing
    const time = dateTime.getTime()
    const sunrise = this.getSunRiseTime(dateTime).getTime()
    const noon = this.getSolarNoonTime(dateTime).getTime()
    const sunset = this.getSunsetTime(dateTime).getTime()

    if (time <= sunrise) {
      const gap = sunrise - this.getNightEndTime(dateTime).getTime()
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

    const gap = this.getNightTime(dateTime) - sunset
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
    sunNormalizationRate,
    redMainFactor = 1,
    whiteMainFactor = 1,
    blueMainFactor = 1,
  }) {
    // from sun illumination rules
    const maxAltitude = this.getMaxSunAltitude(dateTime) || 0.001
    const mixedMaxAltitude = (1 - sunNormalizationRate) + (sunNormalizationRate * maxAltitude)

    const red = this.getRedLight(dateTime, maxRedRatio, minRedRatio, sunNormalizationRate)
    const blue = this.getBlueLight(dateTime, useMoonFraction, minBlueRate)
    const sunIllumination = this.getSunIlluminationRate(dateTime, sunNormalizationRate)
    const white = (sunIllumination <= 0) ? 0 : (sunIllumination - red + (maxRedRatio * mixedMaxAltitude))
    return {
      red: Math.min(1, red * redMainFactor),
      blue: Math.min(1, blue * blueMainFactor),
      white: Math.min(1, white * whiteMainFactor),
    }
  }
}


export default AstralData