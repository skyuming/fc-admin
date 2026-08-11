import type { LawPioneerStatisticsItem, LegalExpertItem } from '@/api/modules/taizhoulu/lawPioneer'

export const mockLawPioneerStatistics: LawPioneerStatisticsItem = {
  current_month_user_count: 353,
  current_month_answer_count: 3553,
  total_user_count: 1452,
  total_answer_count: 25456,
  legal_document_count: 2154,
  legal_expert_count: 12,
}

export const mockLegalExperts: LegalExpertItem[] = [
  {
    name: '张明华',
    title: '浙江XX律师事务所 高级合伙人',
    description: '擅长民商事纠纷、合同纠纷、知识产权等领域，拥有20年从业经验',
  },
  {
    name: '李芳芳',
    title: '杭州市法律援助中心 资深律师',
    description: '专注于婚姻家庭、劳动争议、人身损害赔偿等法律援助工作',
  },
  {
    name: '王建国',
    title: '浙江XX律师事务所 合伙人',
    description: '精通公司法务、企业并购、金融证券等法律事务',
  },
  {
    name: '陈雪梅',
    title: '浙江大学法学院 副教授',
    description: '研究方向为民商法、知识产权法，发表学术论文30余篇',
  },
]