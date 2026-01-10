export const HelpCategory = {
  FOOD: "FOOD",
  MEDICINE: "MEDICINE",
  HYGIENE: "HYGIENE",
  CLOTHES: "CLOTHES",
  ANIMALS: "ANIMALS",
  MILITARY: "MILITARY",
  EQUIPMENT: "EQUIPMENT",
  TRANSPORT: "TRANSPORT",
  OTHER: "OTHER",
} as const;
export type HelpCategory = (typeof HelpCategory)[keyof typeof HelpCategory];

export const HelpCategoryLabels: Record<HelpCategory, string> = {
  [HelpCategory.FOOD]: "Продукти харчування",
  [HelpCategory.MEDICINE]: "Ліки та медицина",
  [HelpCategory.HYGIENE]: "Засоби гігієни",
  [HelpCategory.CLOTHES]: "Одяг та взуття",
  [HelpCategory.ANIMALS]: "Допомога тваринам",
  [HelpCategory.MILITARY]: "Військова допомога",
  [HelpCategory.EQUIPMENT]: "Техніка та обладнання",
  [HelpCategory.TRANSPORT]: "Транспорт та перевезення",
  [HelpCategory.OTHER]: "Інша допомога",
};

export const DeliveryType = {
  SELF_PICKUP: "SELF_PICKUP",
  VOLUNTEER_DELIVERY: "VOLUNTEER_DELIVERY",
  POSTAL_DELIVERY: "POSTAL_DELIVERY",
} as const;
export type DeliveryType = (typeof DeliveryType)[keyof typeof DeliveryType];

export const DeliveryTypeLabels: Record<DeliveryType, string> = {
  [DeliveryType.SELF_PICKUP]: "Самовивіз",
  [DeliveryType.VOLUNTEER_DELIVERY]: "Доставка волонтером",
  [DeliveryType.POSTAL_DELIVERY]: "Нова Пошта / Укрпошта",
};

export const RequestPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;
export type RequestPriority =
  (typeof RequestPriority)[keyof typeof RequestPriority];

export const RequestPriorityLabels: Record<RequestPriority, string> = {
  [RequestPriority.LOW]: "Низький",
  [RequestPriority.MEDIUM]: "Середній",
  [RequestPriority.HIGH]: "Високий",
  [RequestPriority.CRITICAL]: "Критичний",
};

export const RequestStatus = {
  CREATED: "CREATED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
} as const;
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export const RequestStatusLabels: Record<RequestStatus, string> = {
  [RequestStatus.CREATED]: "Нова",
  [RequestStatus.IN_PROGRESS]: "В роботі",
  [RequestStatus.COMPLETED]: "Завершено",
  [RequestStatus.CANCELED]: "Скасовано",
};

export const FulfillmentStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELED: "CANCELED",
} as const;
export type FulfillmentStatus =
  (typeof FulfillmentStatus)[keyof typeof FulfillmentStatus];

export const FulfillmentStatusLabels: Record<FulfillmentStatus, string> = {
  [FulfillmentStatus.PENDING]: "Очікує підтвердження",
  [FulfillmentStatus.APPROVED]: "Прийнято",
  [FulfillmentStatus.REJECTED]: "Відхилено",
  [FulfillmentStatus.CANCELED]: "Скасовано",
};

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  region?: string;
  settlement?: string;
}
export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  region: string;
  settlement: string;
}

export interface HelpRequestPreviewResponse {
  id: number;
  title: string;
  category: HelpCategory;

  region: string;
  settlement: string;

  priority: RequestPriority;

  amount: number;
  receivedAmount: number;

  deliveryType: DeliveryType;
  validUntil: string;

  status: RequestStatus;
}

export interface HelpRequestDto {
  title: string;
  description: string;
  category: HelpCategory | "";
  region: string;
  settlement: string;
  deliveryType: DeliveryType | "";
  contactPhone: string;
  amount: number;
  validUntil: string;
  photoUrl?: string;
  priority: RequestPriority | "";
}

export interface HelpRequestFilter {
  category?: HelpCategory;
  region?: string;
  settlement?: string;
  status?: RequestStatus;
  priority?: RequestPriority;
  deliveryType?: DeliveryType;
  isUrgent?: boolean;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
export interface FulfillmentProposal {
  id: number;
  requestId: number;
  requestTitle: string; // Назва запиту, щоб розуміти, на що відгукнулись
  volunteer: User; // Хто хоче допомогти
  status: FulfillmentStatus; // PENDING, APPROVED, REJECTED
  message: string; // Повідомлення від волонтера ("Можу привезти завтра...")
  createdAt: string;
}
export interface HelpRequestResponse {
  id: number;
  title: string;
  description: string;
  category: HelpCategory;
  region: string;
  settlement: string;
  deliveryType: DeliveryType;
  contactPhone: string;
  authorName: string; // <-- Нове поле
  amount: number;
  receivedAmount: number; // <-- Нове поле (може бути null, тому перевіримо)
  validUntil: string; // LocalDate приходить як рядок "2024-03-20"
  photoUrl?: string; // <-- Нове поле
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string; // LocalDateTime приходить як рядок
}
