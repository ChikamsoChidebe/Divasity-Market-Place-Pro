// Query optimization utilities to prevent N+1 problems
export class QueryOptimizer {
  // Batch fetch users by IDs to avoid N+1 queries
  static async batchFetchUsers(db, userIds) {
    const uniqueIds = [...new Set(userIds.filter(id => id))];
    const users = new Map();
    
    for (const id of uniqueIds) {
      const user = db.findById('users', id);
      if (user) {
        const { password, ...safeUser } = user;
        users.set(id, safeUser);
      }
    }
    
    return users;
  }

  // Batch fetch projects by IDs
  static async batchFetchProjects(db, projectIds) {
    const uniqueIds = [...new Set(projectIds.filter(id => id))];
    const projects = new Map();
    
    for (const id of uniqueIds) {
      const project = db.findById('projects', id);
      if (project) {
        projects.set(id, project);
      }
    }
    
    return projects;
  }

  // Enrich investments with user and project data in batches
  static async enrichInvestments(db, investments) {
    if (!investments || investments.length === 0) return [];

    // Extract unique IDs
    const userIds = investments.map(inv => inv.userId);
    const projectIds = investments.map(inv => inv.projectId);

    // Batch fetch related data
    const [users, projects] = await Promise.all([
      this.batchFetchUsers(db, userIds),
      this.batchFetchProjects(db, projectIds)
    ]);

    // Enrich investments
    return investments.map(investment => ({
      ...investment,
      user: users.get(investment.userId) || null,
      project: projects.get(investment.projectId) || null
    }));
  }

  // Enrich projects with creator data and investment stats
  static async enrichProjects(db, projects) {
    if (!projects || projects.length === 0) return [];

    // Extract unique user IDs
    const userIds = projects.map(p => p.userId);
    const users = await this.batchFetchUsers(db, userIds);

    // Batch fetch investment data for all projects
    const projectInvestments = new Map();
    for (const project of projects) {
      const investments = db.findInvestmentsByProjectId(project.id);
      projectInvestments.set(project.id, investments);
    }

    // Enrich projects
    return projects.map(project => {
      const investments = projectInvestments.get(project.id) || [];
      const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
      const investorCount = new Set(investments.map(inv => inv.userId)).size;

      return {
        ...project,
        creator: users.get(project.userId) || null,
        totalMoneyInvested: totalInvested.toString(),
        investorCount,
        investments: investments.length
      };
    });
  }

  // Calculate statistics efficiently
  static calculateStats(data, calculations) {
    return data.reduce((stats, item) => {
      for (const [key, calculator] of Object.entries(calculations)) {
        if (!stats[key]) stats[key] = calculator.initial || 0;
        stats[key] = calculator.fn(stats[key], item);
      }
      return stats;
    }, {});
  }

  // Paginate results efficiently
  static paginate(data, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const items = data.slice(offset, offset + limit);

    return {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}