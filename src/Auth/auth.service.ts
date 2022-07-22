import { Body, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService{

   constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService){}
   // the fucntion is async because is trying to comunicate with prisma 
    async singup(dto: AuthDto){
        // generate the hash for the password
        const hash = await argon.hash(dto.password);
        // save the user in db
        try{
            const user = await this.prisma.user.create({
                data:{
                    email: dto.email,
                    hash,
                },
            })
            delete user.hash;
            //return that saved user
            return this.signToken(user.id, user.email);
        }catch(error)
        {
            if(error instanceof PrismaClientKnownRequestError){
                if (error.code == 'P2002'){
                    throw new ForbiddenException('Duplicated Credentials');
                }
            }
            throw error;
        };
        
        
        
    }
    
    async singin(dto: AuthDto){
        // find the user, if not found throw exception
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });  
        //compare email, if not found throw exception
        if(!user) throw new ForbiddenException('Credentials Incorrect')

        // compare hash, if not found throw exception
        const pwsMatches = await argon.verify(user.hash,dto.password)
        if(!pwsMatches) throw new ForbiddenException('Credentials Incorrect')


        return this.signToken(user.id, user.email);
  
    }
     async signToken(userId: number, email: string): Promise<{ acces_token: string }>{
        const secret = this.config.get('JWT_SECRET');
        const payload = {
            sub: userId,
            email
        };
        const token = await this.jwt.signAsync(payload,{
            expiresIn: '15m',
            secret: secret,
        });

        return {
            acces_token: token,
        };
    }
}