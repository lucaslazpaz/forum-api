import {
  Controller,
  Get,
} from '@nestjs/common'
import { cpus, hostname, freemem } from 'node:os'

@Controller('/os')
export class OsInfoController {
  constructor() {
  }

  @Get()
  async handle() {
    return {
      message: 'Ok it works...',
      hostname: hostname(),
      cpus: cpus(),
      mem: freemem()
    }
  }
}
