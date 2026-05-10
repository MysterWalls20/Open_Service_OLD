export interface SiteInfo {
  companyName: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  phoneAlt: string;
  email: string;
  schedule: {
    weekdays: string;
    saturday: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    whatsapp: string;
  };
  authorizedBrands: string[];
}