import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('register')
  // async register(@Body() body: any) {
  //   return this.authService.register(body);
  // }

  @Post('import-user')
  importUser(@Body() body: any) {
    console.log('IMPORT USER HIT:', body); 
    return this.authService.importUser(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

}
