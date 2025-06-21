import { Controller, Get, Param, HttpStatus, HttpException } from '@nestjs/common'; // Added HttpException and HttpStatus
import { IaService } from './ia.service';

@Controller('ia')
export class IaController {
  constructor(private iaService: IaService) {}

  @Get('test/:photoPath') // Using a path parameter for the photo path for easier testing
  async test(@Param('photoPath') photoPath: string) {
    try {
      // The IaService.runPythonScript now returns directly the number (confidence score)
      const score = await this.iaService.runPythonScript({ photoPath: photoPath });

      // The original comment "// "result": "{'className': 'lixo', 'score': 0.99}"" is no longer accurate
      // as 'result' is directly the number now.

      if (score < 0.5) {
        return { message: 'Image rejected by IA (confidence < 0.5)', score };
      }

      return { message: 'Image accepted by IA (confidence >= 0.5)', score };
    } catch (error) {
      console.error('Error in IaController test endpoint:', error.message);
      // Depending on your error handling strategy, you might want to return
      // a more specific HTTP status code or error message.
      throw new HttpException(
        `Failed to process image with IA: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // You can also add a default test endpoint with a fixed path for quick checks
  @Get('test-default')
  async testDefault() {
    const defaultPhotoPath = 'C:\\Users\\pc-de-caselli\\Desktop\\Campus-Hackathon\\Hackton-2-try\\backend\\uploads\\test-image.jpg'; // Example

    try {
      const score = await this.iaService.runPythonScript({ photoPath: defaultPhotoPath });

      if (score < 0.5) {
        return { message: 'Image rejected by IA (confidence < 0.5)', score };
      }

      return { message: 'Image accepted by IA (confidence >= 0.5)', score };
    } catch (error) {
      console.error('Error in IaController test-default endpoint:', error.message);
      throw new HttpException(
        `Failed to process default image with IA: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}