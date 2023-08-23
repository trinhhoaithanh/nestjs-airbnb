import { ApiProperty } from "@nestjs/swagger";

export class CreateLocationDto {
    @ApiProperty()
    location_name: string; 

    @ApiProperty()
    province: string;

    @ApiProperty()
    nation: string;

    @ApiProperty()
    location_image: string;
}
