import { IsString, IsNumber, IsObject, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AiSizeData {
  @ApiProperty({ description: 'User height in cm', example: 170 })
  @IsNumber() height: number;
  
  @ApiProperty({ description: 'User weight in kg', example: 65 })
  @IsNumber() weight: number;
  
  @ApiProperty({ description: 'Bust measurement in cm', example: 90 })
  @IsNumber() bust: number;
  
  @ApiProperty({ description: 'Waist measurement in cm', example: 75 })
  @IsNumber() waist: number;
  
  @ApiProperty({ description: 'Hips measurement in cm', example: 95 })
  @IsNumber() hips: number;
  
  @ApiProperty({ description: 'AI confidence score for measurements', example: 0.95 })
  @IsNumber() confidenceScore: number;
}

class UserSizeAdjustments {
  @ApiProperty({ description: 'Adjusted measurement fields', example: { bust: 2, waist: -1 } })
  @IsObject() @IsOptional() adjustedFields?: Record<string, number>;
  
  @ApiProperty({ description: 'Reason for adjustment', example: 'Comfort preference', required: false })
  @IsString() @IsOptional() reason?: string;
}

class ProductAttributes {
  @ApiProperty({ description: 'Product category', example: 'Dresses' })
  @IsString() @IsOptional() category?: string;
  
  @ApiProperty({ description: 'Product brand', example: 'ClotMe Fashion' })
  @IsString() @IsOptional() brand?: string;
  
  @ApiProperty({ description: 'Product size', example: 'M' })
  @IsString() @IsOptional() size?: string;
  
  @ApiProperty({ description: 'Product color', example: 'Blue' })
  @IsString() @IsOptional() color?: string;
  
  @ApiProperty({ description: 'Product price', example: 49.99 })
  @IsNumber() @IsOptional() price?: number;
  
  @ApiProperty({ description: 'City where product is available', example: 'New York' })
  @IsString() @IsOptional() availabilityCity?: string;
}

class RecommendationMetadata {
  @ApiProperty({ description: 'Algorithm version used for recommendation', example: '1.2.0' })
  @IsString() @IsOptional() algorithmVersion?: string;
  
  @ApiProperty({ description: 'Match score for the recommendation', example: 0.87 })
  @IsNumber() @IsOptional() matchScore?: number;
  
  @ApiProperty({ description: 'Basis for the recommendation', example: ['size', 'style', 'previous_purchases'] })
  @IsArray() @IsString({ each: true }) @IsOptional() basis?: string[];
}

class InteractionDetails {
  @ApiProperty({ description: 'Time spent viewing the item in seconds', example: 45 })
  @IsNumber() @IsOptional() dwellTime?: number;
  
  @ApiProperty({ description: 'Number of times user zoomed on the item', example: 3 })
  @IsNumber() @IsOptional() zoomCount?: number;
  
  @ApiProperty({ description: 'Direction user swiped', enum: ['left', 'right'], required: false })
  @IsString() @IsOptional() swipeDirection?: 'left' | 'right';
}

class UserFeedback {
  @ApiProperty({ description: 'Whether the user liked the item', example: true })
  @IsBoolean() @IsOptional() like?: boolean;
  
  @ApiProperty({ description: 'User rating (1-5)', example: 4, required: false })
  @IsNumber() @IsOptional() rating?: number;
  
  @ApiProperty({ description: 'User comment', example: 'Great fit!', required: false })
  @IsString() @IsOptional() comment?: string;
}

class ConversionOutcome {
  @ApiProperty({ description: 'Whether the conversion was successful', example: true })
  @IsBoolean() @IsOptional() success?: boolean;
  
  @ApiProperty({ description: 'Reason for return if applicable', example: 'Wrong size', required: false })
  @IsString() @IsOptional() returnReason?: string;
}

class DeviceInfo {
  @ApiProperty({ description: 'Operating system', example: 'iOS 15.4' })
  @IsString() @IsOptional() os?: string;
  
  @ApiProperty({ description: 'Application version', example: '2.1.0' })
  @IsString() @IsOptional() appVersion?: string;
  
  @ApiProperty({ description: 'Screen resolution', example: '1920x1080' })
  @IsString() @IsOptional() screenResolution?: string;
}

class ErrorDetails {
  @ApiProperty({ description: 'Error code', example: 'ERR_NETWORK' })
  @IsString() @IsOptional() errorCode?: string;
  
  @ApiProperty({ description: 'Error message', example: 'Network connection failed' })
  @IsString() @IsOptional() message?: string;
}

class UserDemographics {
  @ApiProperty({ description: 'User age group', example: '25-34' })
  @IsString() @IsOptional() ageGroup?: string;
  
  @ApiProperty({ description: 'User gender', enum: ['male', 'female'], required: false })
  @IsString() @IsOptional() gender?: 'male' | 'female';
}
  
class TransactionDetails {
  @ApiProperty({ description: 'Final price paid', example: 45.99 })
  @IsNumber() @IsOptional() finalPrice?: number;
  
  @ApiProperty({ description: 'Quantity purchased', example: 2 })
  @IsNumber() @IsOptional() quantity?: number;
  
  @ApiProperty({ description: 'Discount amount applied', example: 5.00, required: false })
  @IsNumber() @IsOptional() discountApplied?: number;
}

export class LogEventDto {
  @ApiProperty({ description: 'User identifier', example: 'user_12345' })
  @IsString() userId: string;
  
  @ApiProperty({ description: 'Session identifier', example: 'sess_67890' })
  @IsString() sessionId: string;
  
  @ApiProperty({ description: 'Event timestamp in ISO format', example: '2023-01-01T12:00:00.000Z', default: new Date().toISOString() })
  @IsString() timestamp: string;
  
  @ApiProperty({ description: 'Location in the app where event occurred', example: '/product/123' })
  @IsString() location: string;
  
  @ApiProperty({ description: 'Type of event', example: 'page_view', enum: ['page_view', 'click', 'purchase', 'size_recommendation'] })
  @IsString() eventType: string;
  
  @ApiProperty({ description: 'Source of the event', example: 'mobile_app' })
  @IsString() eventSource: string;

  @ApiProperty({ description: 'AI-generated size data', required: false, type: () => AiSizeData })
  @ValidateNested() @Type(() => AiSizeData) @IsOptional() aiSizeData?: AiSizeData;
  
  @ApiProperty({ description: 'User adjustments to size recommendations', required: false, type: () => UserSizeAdjustments })
  @ValidateNested() @Type(() => UserSizeAdjustments) @IsOptional() userSizeAdjustments?: UserSizeAdjustments;
  
  @ApiProperty({ description: 'Product identifier', required: false, example: 'prod_12345' })
  @IsString() @IsOptional() productId?: string;
  
  @ApiProperty({ description: 'Product attributes', required: false, type: () => ProductAttributes })
  @ValidateNested() @Type(() => ProductAttributes) @IsOptional() productAttributes?: ProductAttributes;
  @ValidateNested() @Type(() => RecommendationMetadata) @IsOptional() recommendationMetadata?: RecommendationMetadata;
  @ValidateNested() @Type(() => InteractionDetails) @IsOptional() interactionDetails?: InteractionDetails;
  @ValidateNested() @Type(() => UserFeedback) @IsOptional() userFeedback?: UserFeedback;
  @ValidateNested() @Type(() => ConversionOutcome) @IsOptional() conversionOutcome?: ConversionOutcome;
  @IsString() @IsOptional() searchQuery?: string;

  @ApiProperty({ description: 'Device information', type: () => DeviceInfo })
  @ValidateNested() @Type(() => DeviceInfo) deviceInfo: DeviceInfo;
  
  @ApiProperty({ description: 'Network connection type', example: 'wifi', enum: ['wifi', 'cellular', 'unknown'] })
  @IsString() networkType: 'wifi' | 'cellular' | 'unknown';
  
  @ApiProperty({ description: 'Error details if applicable', required: false, type: () => ErrorDetails })
  @ValidateNested() @Type(() => ErrorDetails) @IsOptional() errorDetails?: ErrorDetails;

  @ValidateNested() @Type(() => UserDemographics) @IsOptional() userDemographics?: UserDemographics;
  @ValidateNested() @Type(() => TransactionDetails) @IsOptional() transactionDetails?: TransactionDetails;
}