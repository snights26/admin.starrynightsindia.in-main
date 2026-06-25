export const THEME_STORAGE_KEY = "starry-admin-theme-preference";
export const VALID_THEME_PREFERENCES = ["light", "dark"];
export const THEME_SCHEDULE = {
  dayStartHour: 6,
  nightStartHour: 18,
};

export const getScheduledTheme = (date = new Date()) => {
  const hour = date.getHours();
  return hour >= THEME_SCHEDULE.dayStartHour && hour < THEME_SCHEDULE.nightStartHour ? "light" : "dark";
};
