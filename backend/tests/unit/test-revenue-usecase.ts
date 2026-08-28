declare const process: any;

import { GetSuperAdminRevenueUseCase } from "../../src/application/usecases/super-admin/implementations/GetSuperAdminRevenueUseCase";
import { Subscription } from "../../src/domain/entities/Subscription";
import { PlanType } from "../../src/domain/enums/PlanType.enum";
import { SubscriptionStatus } from "../../src/domain/enums/SubscriptionStatus.enum";

async function runTests() {
  console.log("==========================================================");
  console.log("      GET SUPER ADMIN REVENUE USE CASE UNIT TESTS         ");
  console.log("==========================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // Mock repositories
  const mockSubRepo: any = {
    findAll: async (page: number, limit: number, filters?: any) => {
      const mockSubscriptions = [
        new Subscription({
          id: "sub-123",
          collegeId: "org-456",
          planType: PlanType.PRO,
          status: SubscriptionStatus.ACTIVE,
          gatewaySubscriptionId: "sub_gateway_1",
          aiTokensAllocated: 1000,
          createdAt: new Date("2026-08-20T10:00:00Z"),
          updatedAt: new Date("2026-08-20T10:00:00Z")
        })
      ];
      return {
        subscriptions: mockSubscriptions,
        total: 1
      };
    }
  };

  const mockOrgRepo: any = {
    findById: async (id: string) => {
      if (id === "org-456") {
        return {
          id: "org-456",
          name: "Test Institute of Technology"
        };
      }
      return null;
    }
  };

  const useCase = new GetSuperAdminRevenueUseCase(mockSubRepo, mockOrgRepo);

  try {
    const result = await useCase.execute(1, 5, { search: "Test" });

    // Verify financial summaries are correctly null (as per strict data correctness rules)
    assert(result.summary.totalRevenue === null, "Total revenue should be null");
    assert(result.summary.mrr === null, "MRR should be null");
    assert(result.summary.arr === null, "ARR should be null");
    assert(result.summary.averageRevenuePerCollege === null, "Average revenue per college should be null");

    // Verify chart and breakdown aggregations are empty/null
    assert(Array.isArray(result.monthlyRevenue) && result.monthlyRevenue.length === 0, "Monthly revenue should be an empty array");
    assert(result.planRevenue === null, "Plan revenue should be null");
    assert(Array.isArray(result.topColleges) && result.topColleges.length === 0, "Top colleges list should be an empty array");

    // Verify transaction logs mapping works correctly
    assert(result.transactions.length === 1, "Should map exactly 1 transaction");
    
    const tx = result.transactions[0];
    assert(tx.id === "sub-123", "Transaction ID should match subscription ID");
    assert(tx.invoiceNumber === "INV-2026-SUB-12", "Invoice number should match expected calculation");
    assert(tx.collegeName === "Test Institute of Technology", "College name should match mapped organization name");
    assert(tx.plan === PlanType.PRO, "Plan type should match subscription plan");
    assert(tx.amount === null, "Transaction amount should be null");
    assert(tx.paymentMethod === null, "Payment method should be null");
    assert(tx.status === "PAID", "Mapped transaction status should be PAID for active subscriptions");
    assert(result.total === 1, "Total should count 1 record");

  } catch (err) {
    assert(false, `Tests failed with error: ${err}`);
  }

  console.log("==========================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests();
