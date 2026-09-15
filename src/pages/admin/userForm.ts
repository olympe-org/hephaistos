// Account form data (create / edit)
export interface UserFormData {
  username: string;
  password: string;
  is_admin: boolean;
  // Comma-separated input, see parseFeatures
  features: string;
  max_jobs: number;
  email: string;
}

export const EMPTY_FORM: UserFormData = {
  username: "",
  password: "",
  is_admin: false,
  features: "",
  max_jobs: 1,
  email: "",
};

// "claude, beta" → ["claude", "beta"]
export const parseFeatures = (features: string) =>
  features
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
