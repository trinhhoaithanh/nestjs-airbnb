import { ReviewsService } from './reviews.service';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('Reviews')
@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  // Get reviews
  @Get()
  getReviews() {
    return this.reviewsService.getReviews();
  }

  // Create review
  @ApiHeader({
    name: 'token',
    description: 'Your authentication token',
    required: true,
  })
  @Post()
  createReview(@Headers('token') token, @Body() newReview: CreateReviewDto) {
    return this.reviewsService.createReview(token, newReview);
  }

  // Update review
  @ApiHeader({
    name: 'token',
    description: 'Your authentication token',
    required: true,
  })
  @Put(':id')
  updateReview(
    @Headers('token') token,
    @Param('id') reviewId: number,
    @Body() reviewUpdate: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(
      token,
      Number(reviewId),
      reviewUpdate,
    );
  }

  // Get reviews by room_id
  @Get('reviews-by-room/:room_id')
  getReviewByRoom(@Param('room_id') roomId: Number) {
    return this.reviewsService.getReviewByRoom(+roomId);
  }

  // Delete review by review_id
  @ApiHeader({
    name: 'token',
    description: 'Your authentication token',
    required: true,
  })
  @ApiParam({
    name: "id",
    required: true
  })
  @Delete(':id')
  deleteReviewByReviewId(@Param('id') reviewId, @Headers('token') token) {
    return this.reviewsService.deleteReviewByReviewId(Number(reviewId), token)
  }
}
