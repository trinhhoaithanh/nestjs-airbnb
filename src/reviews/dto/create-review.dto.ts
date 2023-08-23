import { ApiProperty } from "@nestjs/swagger";

export class CreateReviewDto {
    @ApiProperty()
    room_id: number;

    @ApiProperty()
    review_date: Date;

    @ApiProperty()
    content: string;

    @ApiProperty()
    rating: number
}
