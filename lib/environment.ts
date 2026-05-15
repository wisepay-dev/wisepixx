export const isDevelopment = process.env.NODE_ENV === "development";

export const showMocks = isDevelopment && process.env.NEXT_PUBLIC_SHOW_MOCKS === "true";

export const canShowPublicSeedData = showMocks;
