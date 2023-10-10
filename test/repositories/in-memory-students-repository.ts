import { DomainEvents } from '@/core/events/domain-events'
import { StudentsRepository } from '@/domain/forum/application/repositories/students-repository'
import { Question } from '@/domain/forum/enterprise/entities/question'

export class InMemoryStudentsRepository implements StudentsRepository {
  public items: Question[] = []

  async findByEmail(email: string) {
    const question = this.items.find((item) => item.email.toString() === email)

    if (!question) {
      return null
    }

    return question
  }

  async create(question: Question) {
    this.items.push(question)

    DomainEvents.dispatchEventsForAggregate(question.id)
  }
}
