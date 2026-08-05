export interface LessonContent {
  overview: string;
  sections: { heading: string; text: string }[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  content: LessonContent;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  completedCount: number;
  totalLessons: number;
  lessons: Lesson[];
}

export interface CourseData {
  id: string;
  title: string;
  code: string;
  topics: Topic[];
}

export const MOCK_COURSES: Record<string, CourseData> = {
  "physics-0780": {
    id: "physics-0780",
    title: "Physics",
    code: "GCE A-Level • 0780",
    topics: [
      {
        id: "thermodynamics",
        title: "1. Thermodynamics & Thermal Physics",
        description: "Heat transfer, thermal capacity, laws of thermodynamics, and kinetic theory.",
        completedCount: 1,
        totalLessons: 2,
        lessons: [
          {
            id: "heat",
            title: "Heat & Thermal Energy Transfer",
            duration: "10 mins",
            completed: true,
            content: {
              overview: "Heat is the transfer of thermal kinetic energy between bodies at different temperatures.",
              sections: [
                {
                  heading: "1. Thermal Equilibrium",
                  text: "Spontaneous heat transfer continues until thermal equilibrium is established across the medium."
                }
              ]
            }
          },
          {
            id: "first-law",
            title: "First Law of Thermodynamics",
            duration: "15 mins",
            completed: false,
            content: {
              overview: "Energy can change forms, but cannot be created or destroyed.",
              sections: [
                {
                  heading: "1. Energy Balance Equations",
                  text: "Change in internal energy equals net heat added minus work done by the system."
                }
              ]
            }
          }
        ]
      },
      {
        id: "mechanics",
        title: "2. Kinematics & Motion",
        description: "Vectors, velocity-time graphs, projectile trajectories, and Newton's Laws.",
        completedCount: 0,
        totalLessons: 1,
        lessons: [
          {
            id: "projectiles",
            title: "Projectile Motion & Equations",
            duration: "15 mins",
            completed: false,
            content: {
              overview: "Analyzing independent horizontal and vertical acceleration components.",
              sections: [
                {
                  heading: "1. Motion under Gravity",
                  text: "Horizontal velocity remains constant while vertical velocity is accelerated by g."
                }
              ]
            }
          }
        ]
      }
    ]
  },
  "pure-maths-0770": {
    id: "pure-maths-0770",
    title: "Pure Mathematics",
    code: "GCE A-Level • 0770",
    topics: [
      {
        id: "calculus",
        title: "1. Differential & Integral Calculus",
        description: "Limits, differentiation rules, integration by parts, and differential equations.",
        completedCount: 0,
        totalLessons: 2,
        lessons: [
          {
            id: "integration-by-parts",
            title: "Integration by Parts",
            duration: "20 mins",
            completed: false,
            content: {
              overview: "Technique derived from the product rule for differentiating two functions.",
              sections: [
                {
                  heading: "1. The Formula",
                  text: "Integral of u(dv/dx) dx = uv - Integral of v(du/dx) dx."
                }
              ]
            }
          },
          {
            id: "differential-eq",
            title: "First-Order Differential Equations",
            duration: "25 mins",
            completed: false,
            content: {
              overview: "Solving equations involving independent variables and their derivatives.",
              sections: [
                {
                  heading: "1. Separation of Variables",
                  text: "Grouping all terms of one variable on one side before integrating both sides."
                }
              ]
            }
          }
        ]
      }
    ]
  },
  "computer-science-0795": {
    id: "computer-science-0795",
    title: "Computer Science",
    code: "GCE A-Level • 0795",
    topics: [
      {
        id: "data-structures",
        title: "1. Abstract Data Types & Structures",
        description: "Arrays, Linked Lists, Stacks, Queues, Trees, and Hash Tables.",
        completedCount: 0,
        totalLessons: 1,
        lessons: [
          {
            id: "binary-trees",
            title: "Binary Search Trees (BST)",
            duration: "18 mins",
            completed: false,
            content: {
              overview: "Hierarchical data structure where each node has at most two children.",
              sections: [
                {
                  heading: "1. Tree Traversal",
                  text: "In-order, pre-order, and post-order depth-first traversal algorithms."
                }
              ]
            }
          }
        ]
      }
    ]
  }
};