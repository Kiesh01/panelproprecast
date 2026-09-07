export interface PrecastProduct {
  id: string;
  name: string;
  category: 'paving' | 'drainage' | 'boundary' | 'structural';
  image: string;
  imageAlt: string;
  specs: string[];
  description: string;
  standard: string;
  recommendedUse: string;
}

export interface QuoteFormState {
  fullname: string;
  phone: string;
  email: string;
  product: string;
  quantity: string;
  location: string;
  fulfillment: 'Delivery to Site' | 'Yard Pickup';
  message: string;
}
