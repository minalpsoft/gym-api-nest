import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('user/:clientUserId')
  getUser(@Param('clientUserId') clientUserId: string) {
    return this.authService.getUserByClientId(clientUserId);
  }

  @Post('import-user')
  importUser(@Body() body: any) {
    // console.log('IMPORT USER HIT:', body); 
    return this.authService.importUser(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('update-user')
updateUser(@Body() body: any) {
  return this.authService.updateUser(body);
}


}
