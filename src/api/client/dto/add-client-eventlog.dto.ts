import { IsString, IsNumber, IsObject, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AiSizeData {
  @IsNumber() height: number;
  @IsNumber() weight: number;
  @IsNumber() bust: number;
  @IsNumber() waist: number;
  @IsNumber() hips: number;
  @IsNumber() confidenceScore: number;
}

class UserSizeAdjustments {
  @IsObject() adjustedFields: Record<string, number>;
  @IsString() @IsOptional() reason?: string;
}

class ProductAttributes {
  @IsString() category: string;
  @IsString() brand: string;
  @IsString() size: string;
  @IsString() color: string;
  @IsNumber() price: number;
  @IsString() availabilityCity: string;
}

class RecommendationMetadata {
  @IsString() algorithmVersion: string;
  @IsNumber() matchScore: number;
  @IsArray() @IsString({ each: true }) basis: string[];
}

class InteractionDetails {
  @IsNumber() dwellTime: number;
  @IsNumber() zoomCount: number;
  @IsString() @IsOptional() swipeDirection?: 'left' | 'right';
}

class UserFeedback {
  @IsBoolean() like: boolean;
  @IsNumber() @IsOptional() rating?: number;
  @IsString() @IsOptional() comment?: string;
}

class ConversionOutcome {
  @IsBoolean() success: boolean;
  @IsString() @IsOptional() returnReason?: string;
}

class DeviceInfo {
  @IsString() os: string;
  @IsString() appVersion: string;
  @IsString() screenResolution: string;
}

class ErrorDetails {
  @IsString() errorCode: string;
  @IsString() message: string;
}

class UserDemographics {
    @IsString() ageGroup: string;
    @IsString() @IsOptional() gender?: 'male' | 'female';
  }
  
class TransactionDetails {
    @IsNumber() finalPrice: number;
    @IsNumber() quantity: number;
    @IsNumber() @IsOptional() discountApplied?: number;
}

export class LogEventDto {
  @IsString() userId: string;
  @IsString() sessionId: string;
  @IsString() timestamp: string;
  @IsString() location: string;
  @IsString() eventType: string;
  @IsString() eventSource: string;

  @ValidateNested() @Type(() => AiSizeData) @IsOptional() aiSizeData?: AiSizeData;
  @ValidateNested() @Type(() => UserSizeAdjustments) @IsOptional() userSizeAdjustments?: UserSizeAdjustments;
  @IsString() @IsOptional() productId?: string;
  @ValidateNested() @Type(() => ProductAttributes) @IsOptional() productAttributes?: ProductAttributes;
  @ValidateNested() @Type(() => RecommendationMetadata) @IsOptional() recommendationMetadata?: RecommendationMetadata;
  @ValidateNested() @Type(() => InteractionDetails) @IsOptional() interactionDetails?: InteractionDetails;
  @ValidateNested() @Type(() => UserFeedback) @IsOptional() userFeedback?: UserFeedback;
  @ValidateNested() @Type(() => ConversionOutcome) @IsOptional() conversionOutcome?: ConversionOutcome;
  @IsString() @IsOptional() searchQuery?: string;

  @ValidateNested() @Type(() => DeviceInfo) deviceInfo: DeviceInfo;
  @IsString() networkType: 'wifi' | 'cellular' | 'unknown';
  @ValidateNested() @Type(() => ErrorDetails) @IsOptional() errorDetails?: ErrorDetails;

  @ValidateNested() @Type(() => UserDemographics) @IsOptional() userDemographics?: UserDemographics;
  @ValidateNested() @Type(() => TransactionDetails) @IsOptional() transactionDetails?: TransactionDetails;
}