import type { FoodHelpStatisticsItem, BmiStatisticsItem } from '@/api/modules/taizhoulu/foodHelp'

export const mockFoodHelpStatistics: FoodHelpStatisticsItem = {
  current_month_user_count: 353,
  current_month_answer_count: 3553,
  total_user_count: 1452,
  total_answer_count: 25456,
  knowledge_base_count: 353,
  knowledge_slice_count: 2154,
  disease_type_count: 8,
  taboo_type_count: 12,
}

export const mockFoodHelpBmi: BmiStatisticsItem = {
  thin_rate: 35.25,
  overweight_rate: 18.47,
  normal_rate: 26.25,
  obese_rate: 14.85,
}