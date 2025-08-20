import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from './database.js';
import { logger } from './logger.js';

export const seedDatabase = async () => {
  try {
    // Check if data already exists
    const existingUsers = db.findMany('users');
    if (existingUsers.length > 1) { // More than just admin
      logger.info('Database already seeded, skipping...');
      return;
    }

    logger.info('Seeding database with sample data...');

    // Create sample users
    const sampleUsers = [
      {
        email: 'john.creator@example.com',
        firstName: 'John',
        lastName: 'Creator',
        userName: 'johncreator',
        password: await bcrypt.hash('Password123!', 12),
        telephone: '+1234567890',
        address: '123 Creator Street, Innovation City, IC 12345',
        role: 'user',
        IsVerified: true,
      },
      {
        email: 'jane.investor@example.com',
        firstName: 'Jane',
        lastName: 'Investor',
        userName: 'janeinvestor',
        password: await bcrypt.hash('Password123!', 12),
        telephone: '+1234567891',
        address: '456 Investor Avenue, Finance District, FD 67890',
        role: 'user',
        IsVerified: true,
      },
      {
        email: 'mike.entrepreneur@example.com',
        firstName: 'Mike',
        lastName: 'Entrepreneur',
        userName: 'mikeentrepreneur',
        password: await bcrypt.hash('Password123!', 12),
        telephone: '+1234567892',
        address: '789 Startup Boulevard, Tech Valley, TV 11111',
        role: 'user',
        IsVerified: true,
      },
      {
        email: 'sarah.innovator@example.com',
        firstName: 'Sarah',
        lastName: 'Innovator',
        userName: 'sarahinnovator',
        password: await bcrypt.hash('Password123!', 12),
        telephone: '+1234567893',
        address: '321 Innovation Lane, Future City, FC 22222',
        role: 'user',
        IsVerified: true,
      },
    ];

    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = db.create('users', userData);
      createdUsers.push(user);
    }

    // Create sample projects
    const sampleProjects = [
      {
        userId: createdUsers[0].id,
        name: 'Revolutionary Solar Panel Technology',
        category: 'Energy',
        expectedRaiseAmount: '500000',
        totalMoneyInvested: '0',
        description: 'Developing next-generation solar panels with 40% higher efficiency than current market leaders. Our innovative perovskite-silicon tandem cells promise to revolutionize renewable energy adoption worldwide.',
        status: 'OPEN',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
      },
      {
        userId: createdUsers[2].id,
        name: 'AI-Powered Healthcare Diagnostics',
        category: 'Healthcare',
        expectedRaiseAmount: '750000',
        totalMoneyInvested: '0',
        description: 'Building an AI system that can diagnose diseases from medical images with 95% accuracy. Our deep learning models have been trained on millions of medical scans and validated by leading hospitals.',
        status: 'OPEN',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000).toISOString(), // 9 months from now
      },
      {
        userId: createdUsers[3].id,
        name: 'Sustainable Urban Farming Platform',
        category: 'Agriculture',
        expectedRaiseAmount: '300000',
        totalMoneyInvested: '0',
        description: 'Creating vertical farming systems for urban environments using hydroponic technology and IoT sensors. Our solution can produce 10x more food per square foot than traditional farming.',
        status: 'OPEN',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(), // 5 months from now
      },
      {
        userId: createdUsers[0].id,
        name: 'Blockchain-Based Supply Chain Tracker',
        category: 'Technology',
        expectedRaiseAmount: '400000',
        totalMoneyInvested: '0',
        description: 'Developing a transparent supply chain tracking system using blockchain technology. Companies can trace products from origin to consumer, ensuring authenticity and ethical sourcing.',
        status: 'OPEN',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(), // ~6.5 months from now
      },
      {
        userId: createdUsers[2].id,
        name: 'Smart Water Management System',
        category: 'Environment',
        expectedRaiseAmount: '600000',
        totalMoneyInvested: '450000',
        description: 'IoT-enabled water management system for smart cities. Our sensors monitor water quality, detect leaks, and optimize distribution in real-time, reducing waste by up to 30%.',
        status: 'FUNDED',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months from now
      },
    ];

    const createdProjects = [];
    for (const projectData of sampleProjects) {
      const project = db.create('projects', projectData);
      createdProjects.push(project);
    }

    // Create sample investments
    const sampleInvestments = [
      {
        userId: createdUsers[1].id, // Jane Investor
        projectId: createdProjects[0].id, // Solar Panel project
        amount: '25000',
        returnAmount: '32500',
        successRate: 78,
      },
      {
        userId: createdUsers[1].id, // Jane Investor
        projectId: createdProjects[1].id, // AI Healthcare project
        amount: '50000',
        returnAmount: '67500',
        successRate: 82,
      },
      {
        userId: createdUsers[3].id, // Sarah Innovator
        projectId: createdProjects[0].id, // Solar Panel project
        amount: '15000',
        returnAmount: '19500',
        successRate: 75,
      },
      {
        userId: createdUsers[1].id, // Jane Investor
        projectId: createdProjects[4].id, // Smart Water project (funded)
        amount: '100000',
        returnAmount: '135000',
        successRate: 88,
      },
      {
        userId: createdUsers[3].id, // Sarah Innovator
        projectId: createdProjects[4].id, // Smart Water project (funded)
        amount: '75000',
        returnAmount: '97500',
        successRate: 85,
      },
      {
        userId: createdUsers[0].id, // John Creator (investing in others' projects)
        projectId: createdProjects[4].id, // Smart Water project (funded)
        amount: '200000',
        returnAmount: '260000',
        successRate: 90,
      },
      {
        userId: createdUsers[2].id, // Mike Entrepreneur
        projectId: createdProjects[4].id, // Smart Water project (funded)
        amount: '75000',
        returnAmount: '97500',
        successRate: 85,
      },
    ];

    for (const investmentData of sampleInvestments) {
      db.create('investments', investmentData);
    }

    // Update project total investments
    createdProjects[0].totalMoneyInvested = '40000'; // Solar Panel: 25000 + 15000
    createdProjects[1].totalMoneyInvested = '50000'; // AI Healthcare: 50000
    createdProjects[4].totalMoneyInvested = '450000'; // Smart Water: 100000 + 75000 + 200000 + 75000

    db.update('projects', createdProjects[0].id, { totalMoneyInvested: '40000' });
    db.update('projects', createdProjects[1].id, { totalMoneyInvested: '50000' });

    // Create sample news articles
    const adminUser = db.findUserByEmail(process.env.ADMIN_EMAIL || 'admin@divasity.com');
    const sampleNews = [
      {
        UserId: adminUser.id,
        Newstitle: 'Divasity Platform Reaches $10M in Total Investments',
        Newscontent: 'We are thrilled to announce that the Divasity platform has successfully facilitated over $10 million in investments across innovative projects. This milestone represents the growing trust our community has in groundbreaking technologies and sustainable solutions. From renewable energy to AI-powered healthcare, our investors are driving the future of innovation.',
        Newsimage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
        links: 'https://divasity.com/milestone-10m',
        categories: ['Investment', 'News', 'Milestone'],
      },
      {
        UserId: adminUser.id,
        Newstitle: 'New Partnership with Leading Universities for Research Projects',
        Newscontent: 'Divasity is proud to announce strategic partnerships with top-tier universities to bring cutting-edge research projects to our investment platform. These collaborations will provide our investors with exclusive access to breakthrough technologies in fields such as biotechnology, clean energy, and artificial intelligence. University researchers will benefit from direct access to funding and industry expertise.',
        Newsimage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
        links: 'https://divasity.com/university-partnerships',
        categories: ['Partnership', 'Research', 'Education'],
      },
      {
        UserId: adminUser.id,
        Newstitle: 'Q4 2024 Investment Trends: Sustainability Takes Center Stage',
        Newscontent: 'Our latest quarterly report reveals that sustainable and environmental projects have attracted 65% of all investments on the Divasity platform in Q4 2024. Investors are increasingly prioritizing projects that address climate change, renewable energy, and environmental conservation. This trend reflects a growing awareness of the importance of sustainable investing for long-term returns.',
        Newsimage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        links: 'https://divasity.com/q4-2024-trends',
        categories: ['Analysis', 'Sustainability', 'Market'],
      },
      {
        UserId: adminUser.id,
        Newstitle: 'Success Story: AI Healthcare Startup Completes Clinical Trials',
        Newscontent: 'One of our funded projects, an AI-powered diagnostic system, has successfully completed Phase II clinical trials with remarkable results. The system demonstrated 95% accuracy in early disease detection, potentially revolutionizing preventive healthcare. This success story showcases the potential of innovative projects funded through our platform to create real-world impact.',
        Newsimage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
        links: 'https://divasity.com/ai-healthcare-success',
        categories: ['Success Story', 'Healthcare', 'Technology'],
      },
      {
        UserId: adminUser.id,
        Newstitle: 'Enhanced Security Measures and Platform Updates',
        Newscontent: 'We have implemented advanced security measures including multi-factor authentication, enhanced encryption, and real-time fraud detection to protect our users\' investments and personal information. Additionally, our platform now features improved analytics, better project discovery tools, and enhanced mobile experience. Your security and user experience remain our top priorities.',
        Newsimage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
        links: 'https://divasity.com/security-updates',
        categories: ['Security', 'Platform', 'Updates'],
      },
    ];

    for (const newsData of sampleNews) {
      db.create('news', newsData);
    }

    logger.info('Database seeded successfully with sample data');
    logger.info(`Created ${createdUsers.length} users, ${createdProjects.length} projects, ${sampleInvestments.length} investments, and ${sampleNews.length} news articles`);

  } catch (error) {
    logger.error('Error seeding database:', error);
  }
};

export default seedDatabase;