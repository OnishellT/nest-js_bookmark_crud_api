import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "src/prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./dto/strategy";

@Module ({
    imports: [PrismaModule, JwtModule.register({})],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController]
})

export class AuthModule{}