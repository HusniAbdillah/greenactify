
export function formatRelativeTime(date: Date | string): string {
  const activityDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Baru saja';
  } else if (diffInHours < 24) {
    return `${diffInHours} jam lalu`;
  } else if (diffInHours < 48) {
    return '1 hari lalu';
  } else if (diffInHours < 168) { // 7 days
    const days = Math.floor(diffInHours / 24);
    return `${days} hari lalu`;
  } else if (diffInHours < 720) { // 30 days
    const weeks = Math.floor(diffInHours / 168);
    return `${weeks} minggu lalu`;
  } else {
    const months = Math.floor(diffInHours / 720);
    return `${months} bulan lalu`;
  }
}

export function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    planting: 'bg-green-100',
    recycling: 'bg-blue-100',
    transport: 'bg-yellow-100',
    cleanup: 'bg-purple-100',
    energy: 'bg-orange-100',
    composting: 'bg-emerald-100',
    reduce_waste: 'bg-teal-100'
  };
  return colors[category] || 'bg-gray-100';
}

export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500 bg-opacity-20 text-green-800';
    case 'medium':
      return 'bg-yellow-500 bg-opacity-20 text-yellow-800';
    case 'hard':
      return 'bg-red-500 bg-opacity-20 text-red-800';
    default:
      return 'bg-gray-500 bg-opacity-20 text-gray-800';
  }
}

export function getStatusColor(status: 'completed' | 'pending' | 'rejected'): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function formatTimeRemaining(hoursRemaining: number): string {
  if (hoursRemaining <= 0) {
    return 'Tantangan berakhir';
  } else if (hoursRemaining < 24) {
    return `Berakhir dalam ${hoursRemaining} jam`;
  } else {
    const days = Math.floor(hoursRemaining / 24);
    const hours = hoursRemaining % 24;
    return `Berakhir dalam ${days} hari ${hours > 0 ? `${hours} jam` : ''}`;
  }
}

export function calculateUserStats(activities: any[]) {
  const completedActivities = activities.filter(a => a.status === 'completed');
  const totalPoints = completedActivities.reduce((sum, activity) => sum + activity.points, 0);

  return {
    totalPoints,
    completedActivities: completedActivities.length,
    pendingActivities: activities.filter(a => a.status === 'pending').length,
    totalActivities: activities.length
  };
}
