import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const limitQueryParamSchema = z
  .string()
  .optional()
  .default('20')
  .transform(Number)
  .pipe(z.number().min(20))

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type LimitQueryParamSchema = z.infer<typeof limitQueryParamSchema>

const queryParamPageValidationPipe = new ZodValidationPipe(pageQueryParamSchema)
const queryParamLimitValidationPipe = new ZodValidationPipe(
  limitQueryParamSchema,
)

@Controller('/questions')
export class FetchQuestionsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async handle(
    @Query('page', queryParamPageValidationPipe) page: PageQueryParamSchema,
    @Query('limit', queryParamLimitValidationPipe) limit: LimitQueryParamSchema,
  ) {
    const questions = await this.prisma.question.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { questions }
  }
}
