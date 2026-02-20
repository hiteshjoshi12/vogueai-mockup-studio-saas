export enum ModelGender {
  FEMALE = "Female",
  MALE = "Male",
}

export enum ModelEthnicity {
  CAUCASIAN = "Caucasian",
  AFRICAN = "Black/African",
  ASIAN = "Asian",
  LATINO = "Latino/Hispanic",
  INDIAN = "Indian/South Asian",
  MIDDLE_EASTERN = "Middle Eastern", // Added for demographic completeness
}

export enum SettingType {
  STUDIO = "Clean Studio Background",
  STREET = "Urban Street",
  NATURE = "Nature/Park",
  LUXURY = "Luxury Interior",
  BEACH = "Sunny Beach",
  CAFE = "Aesthetic Cafe Background", // Added high-demand lifestyle setting
}

export enum LightingStyle {
  SOFT = "Softbox Studio Lighting",
  SUNLIGHT = "Natural Sunlight",
  CINEMATIC = "Moody Cinematic",
  NEON = "Neon/Cyberpunk",
  HARSH_FLASH = "Harsh Editorial Flash", // Highly popular in high-fashion/streetwear
}

export enum ProductCategory {
  UPPER_BODY = "Top/Jacket/Hoodie",
  LOWER_BODY = "Pants/Skirt/Shorts",
  FULL_BODY = "Full Outfit/Dress",
  FOOTWEAR = "Shoes/Sneakers",
  ACCESSORIES = "Bag/Hat/Jewelry",
}

export interface MockupConfig {
  gender: ModelGender;
  ethnicity: ModelEthnicity;
  setting: SettingType;
  lighting: LightingStyle;
  category: ProductCategory;
  age: string;
}

// SAAS UPDATE: Prepared for MongoDB integration and billing history
export interface GenerationResult {
  id?: string;           // Maps to MongoDB _id when fetching past generations
  imageUrl: string;      // The AWS S3 or Cloudinary URL in production
  timestamp: number;     // Epoch time of creation
  tokenCost?: number;    // Tracks how many credits were deducted for this run
}