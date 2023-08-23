import { ApiProperty } from "@nestjs/swagger";

export class FileUploadLocationDto {
    @ApiProperty({type: "string", format: "binary"})
    file: any; 
}