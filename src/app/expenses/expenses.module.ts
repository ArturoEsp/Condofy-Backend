import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ExpensesPrismaRepository } from './infrastructure/repositories/expenses.prisma.repository';
import { ExpensesController } from './presentation/controllers/expenses.controller';
import { CreateExpenseUseCase } from './application/use-cases/create-expense.usecase';
import { GetExpensesUseCase } from './application/use-cases/get-expenses.usecase';
import { GetExpenseByIdUseCase } from './application/use-cases/get-expense-by-id.usecase';
import { UpdateExpenseUseCase } from './application/use-cases/update-expense.usecase';
import { DeleteExpenseUseCase } from './application/use-cases/delete-expense.usecase';
import { GetExpensesSummaryUseCase } from './application/use-cases/get-expenses-summary.usecase';
import { GetTransparencySettingsUseCase } from './application/use-cases/get-transparency-settings.usecase';
import { UpdateTransparencySettingsUseCase } from './application/use-cases/update-transparency-settings.usecase';
import { GetTransparencyReportUseCase } from './application/use-cases/get-transparency-report.usecase';

@Module({
  imports: [CoreModule],
  providers: [
    {
      provide: PROVIDES_NAMES.ExpensesRepository,
      useClass: ExpensesPrismaRepository,
    },
    {
      provide: CreateExpenseUseCase,
      inject: [PROVIDES_NAMES.ExpensesRepository],
      useFactory: (repo) => new CreateExpenseUseCase(repo),
    },
    {
      provide: GetExpensesUseCase,
      inject: [PROVIDES_NAMES.ExpensesRepository],
      useFactory: (repo) => new GetExpensesUseCase(repo),
    },
    {
      provide: GetExpenseByIdUseCase,
      inject: [PROVIDES_NAMES.ExpensesRepository],
      useFactory: (repo) => new GetExpenseByIdUseCase(repo),
    },
    {
      provide: UpdateExpenseUseCase,
      inject: [PROVIDES_NAMES.ExpensesRepository],
      useFactory: (repo) => new UpdateExpenseUseCase(repo),
    },
    {
      provide: DeleteExpenseUseCase,
      inject: [
        PROVIDES_NAMES.ExpensesRepository,
        PROVIDES_NAMES.StorageService,
      ],
      useFactory: (repo, storage) => new DeleteExpenseUseCase(repo, storage),
    },
    {
      provide: GetExpensesSummaryUseCase,
      inject: [PROVIDES_NAMES.ExpensesRepository],
      useFactory: (repo) => new GetExpensesSummaryUseCase(repo),
    },
    {
      provide: GetTransparencySettingsUseCase,
      inject: [PROVIDES_NAMES.ExpensesRepository],
      useFactory: (repo) => new GetTransparencySettingsUseCase(repo),
    },
    {
      provide: UpdateTransparencySettingsUseCase,
      inject: [PROVIDES_NAMES.ExpensesRepository],
      useFactory: (repo) => new UpdateTransparencySettingsUseCase(repo),
    },
    {
      provide: GetTransparencyReportUseCase,
      inject: [PROVIDES_NAMES.ExpensesRepository],
      useFactory: (repo) => new GetTransparencyReportUseCase(repo),
    },
  ],
  controllers: [ExpensesController],
  exports: [PROVIDES_NAMES.ExpensesRepository],
})
export class ExpensesModule {}
