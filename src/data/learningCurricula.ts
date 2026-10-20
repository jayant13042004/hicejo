export interface SkillResource {
  type: "video" | "notes" | "practice";
  title: string;
  link: string;
}

export interface SkillItem {
  id: string;
  name: string;
  desc: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  completed: boolean;
  portfolioBullet: string;
  resources: SkillResource[];
}

export interface CurriculumModule {
  id: string;
  number: number;
  title: string;
  skills: SkillItem[];
}

export interface RoleCurriculum {
  id: string;
  roleTitle: string;
  category: string;
  tagline: string;
  totalHours: string;
  externalRoadmapUrl?: string;
  externalRoadmapLabel?: string;
  preparationPlatformUrl?: string;
  preparationPlatformLabel?: string;
  secondaryRoadmapUrl?: string;
  secondaryRoadmapLabel?: string;
  modules: CurriculumModule[];
}

export const ROLE_CURRICULA: RoleCurriculum[] = [
  {
    id: "foundation",
    roleTitle: "Career Foundation (Start Here With No Experience)",
    category: "Foundation",
    tagline:
      "The shared skills every role depends on: version control, reading code, terminal basics, debugging, testing, documentation, and communicating your work. Complete this before any role track.",
    totalHours: "22 hours",
    externalRoadmapUrl: "https://roadmap.sh/computer-science",
    externalRoadmapLabel: "roadmap.sh / Computer Science",
    modules: [
      {
        id: "found-mod-1",
        number: 1,
        title: "Working Like a Professional Engineer",
        skills: [
          {
            id: "found-sk-1",
            name: "Git, GitHub & the Pull Request Workflow",
            desc: "Initialize repositories, stage and commit meaningful changes, branch, open pull requests, review diffs, and recover from mistakes with revert/reset. Every engineering job assumes this on day one.",
            duration: "150 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Maintained a public GitHub history with feature branches and reviewed pull requests, demonstrating collaborative version control.",
            resources: [
              { type: "video", title: "Git and GitHub for Beginners — Crash Course (freeCodeCamp)", link: "https://www.youtube.com/watch?v=RGOj5yH7evk" },
              { type: "notes", title: "Pro Git Book (Official, Free)", link: "https://git-scm.com/book/en/v2" },
              { type: "practice", title: "Learn Git Branching — Interactive Visual Sandbox", link: "https://learngitbranching.js.org/" }
            ]
          },
          {
            id: "found-sk-2",
            name: "Terminal & Command Line Fundamentals",
            desc: "Navigate file systems, chain commands, use pipes and redirects, read exit codes, edit files without a GUI, and understand environment variables.",
            duration: "120 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Automated repetitive project setup tasks using shell commands, environment variables, and scripted workflows.",
            resources: [
              { type: "notes", title: "The Missing Semester of Your CS Education (MIT)", link: "https://missing.csail.mit.edu/" },
              { type: "notes", title: "Linux Journey — Command Line Fundamentals", link: "https://linuxjourney.com/" },
              { type: "practice", title: "OverTheWire: Bandit (Levels 0–15)", link: "https://overthewire.org/wargames/bandit/" }
            ]
          },
          {
            id: "found-sk-3",
            name: "Reading an Unfamiliar Codebase",
            desc: "Orient yourself in a new repository: read the README and package manifest, trace an entry point, follow an import graph, and find where a feature actually lives.",
            duration: "120 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Onboarded onto an unfamiliar codebase by tracing entry points and dependency graphs, shipping a scoped fix within the first working session.",
            resources: [
              { type: "notes", title: "Missing Semester: Debugging & Profiling (MIT)", link: "https://missing.csail.mit.edu/2020/debugging-profiling/" },
              { type: "notes", title: "GitHub Docs: Exploring Projects & Repositories", link: "https://docs.github.com/en/get-started/exploring-projects-on-github" },
              { type: "practice", title: "Pick any open-source repo and map its entry point", link: "https://github.com/explore" }
            ]
          }
        ]
      },
      {
        id: "found-mod-2",
        number: 2,
        title: "Debugging, Testing & Quality",
        skills: [
          {
            id: "found-sk-4",
            name: "Systematic Debugging (Not Guessing)",
            desc: "Reproduce reliably, isolate variables, read stack traces from the top of your own code, bisect changes, and confirm a fix with a regression test.",
            duration: "120 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Resolved a production defect by reproducing the failure, bisecting the offending commit, and locking the fix behind a regression test.",
            resources: [
              { type: "notes", title: "How to Debug Small Programs (Eric Lippert)", link: "https://ericlippert.com/2014/03/05/how-to-debug-small-programs/" },
              { type: "notes", title: "Chrome DevTools: Debug JavaScript", link: "https://developer.chrome.com/docs/devtools/javascript/" },
              { type: "practice", title: "Fix a deliberately broken open-source exercise", link: "https://github.com/exercism" }
            ]
          },
          {
            id: "found-sk-5",
            name: "Testing Fundamentals & Test-Driven Thinking",
            desc: "Understand unit vs integration vs end-to-end tests, write a failing test before a fix, assert meaningful behavior rather than implementation details, and keep tests fast and deterministic.",
            duration: "120 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Introduced automated tests around a critical code path, catching regressions before release and documenting intended behavior.",
            resources: [
              { type: "notes", title: "Martin Fowler: The Practical Test Pyramid", link: "https://martinfowler.com/articles/practical-test-pyramid.html" },
              { type: "notes", title: "Vitest — Getting Started Guide", link: "https://vitest.dev/guide/" },
              { type: "practice", title: "Write tests for a small utility you built", link: "https://exercism.org/" }
            ]
          }
        ]
      },
      {
        id: "found-mod-3",
        number: 3,
        title: "Communicating Your Work",
        skills: [
          {
            id: "found-sk-6",
            name: "Writing Clear Technical Documentation",
            desc: "Write READMEs that let a stranger run your project, document decisions and trade-offs, and structure a bug report or proposal so others can act on it.",
            duration: "90 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Documented project setup, architecture decisions, and usage so a new contributor could run it without asking questions.",
            resources: [
              { type: "notes", title: "Google Developer Documentation Style Guide", link: "https://developers.google.com/style" },
              { type: "notes", title: "GitHub Docs: About READMEs", link: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes" },
              { type: "practice", title: "Rewrite the README of your own project", link: "https://www.makeareadme.com/" }
            ]
          },
          {
            id: "found-sk-7",
            name: "Explaining Your Work in an Interview",
            desc: "Turn a project into a STAR story: situation, task, action, result. Describe trade-offs you made, what you would change, and the measurable outcome — without inventing metrics.",
            duration: "90 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Presented project decisions and outcomes in structured STAR format, defending trade-offs under follow-up questions.",
            resources: [
              { type: "notes", title: "Behavioral Interview Guide — The STAR Method (The Muse)", link: "https://www.themuse.com/advice/star-interview-method" },
              { type: "notes", title: "Pramp: Free Peer Mock Interviews", link: "https://www.pramp.com/" },
              { type: "practice", title: "Record a 2-minute STAR answer for one project", link: "https://www.pramp.com/" }
            ]
          },
          {
            id: "found-sk-8",
            name: "Using AI Tools Honestly (and Verifying Them)",
            desc: "Use AI assistants to accelerate work while verifying every claim, understanding generated code, and never presenting fabricated output as your own evidence.",
            duration: "60 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Used AI-assisted development responsibly, reviewing and verifying every generated change before merging.",
            resources: [
              { type: "notes", title: "Stanford HAI: The Hallucination Problem in AI", link: "https://hai.stanford.edu/news/ais-hallucination-problem" },
              { type: "notes", title: "Vitest — Verifying Behavior with Tests", link: "https://vitest.dev/guide/" },
              { type: "practice", title: "Take an AI-generated function and prove it correct with tests", link: "https://exercism.org/" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "swe-dsa",
    roleTitle: "Software Engineer (DSA & Problem Solving)",
    category: "Software Engineering",
    tagline: "Industry-standard data structures, algorithms, and pattern recognition mapped directly to Striver's A2Z DSA Sheet, takeUforward, and LeetCode.",
    totalHours: "48 hours",
    externalRoadmapUrl: "https://roadmap.sh/datastructures-and-algorithms",
    externalRoadmapLabel: "roadmap.sh / DSA",
    preparationPlatformUrl: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
    preparationPlatformLabel: "takeUforward (Striver's A2Z DSA Sheet)",
    secondaryRoadmapUrl: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/",
    secondaryRoadmapLabel: "Striver's SDE Sheet (Top Coding Problems)",
    modules: [
      {
        id: "dsa-mod-1",
        number: 1,
        title: "Arrays, Strings & Pointers",
        skills: [
          {
            id: "dsa-sk-arr",
            name: "Arrays",
            desc: "Contiguous memory layout, dynamic array resizing, in-place manipulation, prefix sums, and Kadane's algorithm for maximum subarray sum.",
            duration: "80 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Optimized streaming data buffers utilizing in-place array manipulation, minimizing memory reallocations.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's A2Z Arrays Sheet", link: "https://takeuforward.org/data-structure/arrays/" },
              { type: "practice", title: "LeetCode 53: Maximum Subarray", link: "https://leetcode.com/problems/maximum-subarray/" },
              { type: "practice", title: "LeetCode 1: Two Sum", link: "https://leetcode.com/problems/two-sum/" }
            ]
          },
          {
            id: "dsa-sk-str",
            name: "Strings",
            desc: "String immutability, ASCII/Unicode character frequency counting, palindromes, substring checking, and string anagram validation.",
            duration: "75 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Implemented high-throughput string tokenization and sanitization with constant memory overhead.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's A2Z Strings Sheet", link: "https://takeuforward.org/data-structure/string/" },
              { type: "practice", title: "LeetCode 242: Valid Anagram", link: "https://leetcode.com/problems/valid-anagram/" },
              { type: "practice", title: "LeetCode 14: Longest Common Prefix", link: "https://leetcode.com/problems/longest-common-prefix/" }
            ]
          },
          {
            id: "dsa-sk-1",
            name: "Two Pointers",
            desc: "Opposite-end and same-direction pointer techniques to eliminate nested loops and achieve O(n) linear scans on sequences.",
            duration: "90 min",
            difficulty: "Beginner",
            completed: true,
            portfolioBullet: "Optimized sorted array search and partition routines using in-place two-pointer scans, reducing auxiliary memory to O(1).",
            resources: [
              { type: "notes", title: "takeUforward: Two Pointer Approach & Problems", link: "https://takeuforward.org/data-structure/two-pointer-approach-problems/" },
              { type: "practice", title: "LeetCode 11: Container With Most Water", link: "https://leetcode.com/problems/container-with-most-water/" },
              { type: "practice", title: "LeetCode 15: 3Sum", link: "https://leetcode.com/problems/3sum/" }
            ]
          },
          {
            id: "dsa-sk-2",
            name: "Sliding Window",
            desc: "Fixed-size and dynamically expanding/contracting windows for computing subarray sums, longest substrings with constraints, and frequency limits.",
            duration: "90 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Engineered sliding-window event aggregation logic handling high-frequency metrics with O(n) algorithmic complexity.",
            resources: [
              { type: "notes", title: "takeUforward: Sliding Window & Two Pointer Sheet", link: "https://takeuforward.org/data-structure/sliding-window/" },
              { type: "practice", title: "LeetCode 3: Longest Substring Without Repeating Characters", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
              { type: "practice", title: "LeetCode 76: Minimum Window Substring", link: "https://leetcode.com/problems/minimum-window-substring/" }
            ]
          },
          {
            id: "dsa-sk-3",
            name: "Prefix Sum",
            desc: "Precomputing cumulative sum arrays to answer range sum queries in O(1) time and solve subarray sum count problems.",
            duration: "60 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Implemented prefix sum range query caches, accelerating telemetry computations to O(1) instant lookups.",
            resources: [
              { type: "notes", title: "takeUforward: Subarray Sum Equals K Deep Dive", link: "https://takeuforward.org/arrays/subarray-sum-equals-k/" },
              { type: "practice", title: "LeetCode 560: Subarray Sum Equals K", link: "https://leetcode.com/problems/subarray-sum-equals-k/" }
            ]
          }
        ]
      },
      {
        id: "dsa-mod-2",
        number: 2,
        title: "Searching & Sorting",
        skills: [
          {
            id: "dsa-sk-4",
            name: "Binary Search",
            desc: "Logarithmic search on sorted arrays, search space reduction, binary search on answers, rotated sorted arrays, and matrix search.",
            duration: "90 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Accelerated numerical optimization searches by formulating monotonic condition bounds evaluated via binary search.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's Binary Search Complete Series", link: "https://takeuforward.org/binary-search/binary-search-practice-problems/" },
              { type: "practice", title: "LeetCode 33: Search in Rotated Sorted Array", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
              { type: "practice", title: "LeetCode 704: Binary Search", link: "https://leetcode.com/problems/binary-search/" }
            ]
          },
          {
            id: "dsa-sk-sort",
            name: "Sorting Algorithms",
            desc: "Core comparison-based sorts (Merge Sort, Quick Sort), in-place partitioning, stability, and non-comparison counting/radix sorts.",
            duration: "75 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Implemented custom divide-and-conquer sorting routines with guaranteed O(n log n) runtime boundaries.",
            resources: [
              { type: "notes", title: "takeUforward: Sorting Algorithms Guide (Merge, Quick, Insertion)", link: "https://takeuforward.org/sorting/sorting-techniques/" },
              { type: "practice", title: "LeetCode 912: Sort an Array", link: "https://leetcode.com/problems/sort-an-array/" },
              { type: "practice", title: "LeetCode 75: Sort Colors", link: "https://leetcode.com/problems/sort-colors/" }
            ]
          }
        ]
      },
      {
        id: "dsa-mod-3",
        number: 3,
        title: "Linear & Associative Data Structures",
        skills: [
          {
            id: "dsa-sk-ll",
            name: "Linked List",
            desc: "Singly and doubly linked lists, fast/slow pointer cycle detection (Floyd's algorithm), reversing lists, and LRU Cache node management.",
            duration: "90 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Built memory-efficient pointer-linked buffers ensuring constant-time head and tail node reordering.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's Linked List Series", link: "https://takeuforward.org/data-structure/linked-list/" },
              { type: "practice", title: "LeetCode 206: Reverse Linked List", link: "https://leetcode.com/problems/reverse-linked-list/" },
              { type: "practice", title: "LeetCode 141: Linked List Cycle", link: "https://leetcode.com/problems/linked-list-cycle/" },
              { type: "practice", title: "LeetCode 146: LRU Cache", link: "https://leetcode.com/problems/lru-cache/" }
            ]
          },
          {
            id: "dsa-sk-5",
            name: "Hash Table (Hash Map)",
            desc: "Key-value indexing, hash functions, collision handling (chaining & open addressing), load factor, and frequency count patterns.",
            duration: "80 min",
            difficulty: "Beginner",
            completed: true,
            portfolioBullet: "Architected high-throughput key-value lookup indices achieving average O(1) read latencies under memory constraints.",
            resources: [
              { type: "notes", title: "takeUforward: Hashing & Frequency Counting Fundamentals", link: "https://takeuforward.org/data-structure/hashing/" },
              { type: "practice", title: "LeetCode 49: Group Anagrams", link: "https://leetcode.com/problems/group-anagrams/" },
              { type: "practice", title: "LeetCode 128: Longest Consecutive Sequence", link: "https://leetcode.com/problems/longest-consecutive-sequence/" }
            ]
          },
          {
            id: "dsa-sk-6",
            name: "Stack & Monotonic Stack",
            desc: "LIFO execution, parentheses matching, expression evaluation, and monotonic stacks for Next Greater Element and largest rectangle in histogram.",
            duration: "90 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Resolved range extrema queries in O(n) linear time utilizing monotonic stack structures.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's Stack & Queue Series", link: "https://takeuforward.org/data-structure/stack-and-queue/" },
              { type: "practice", title: "LeetCode 20: Valid Parentheses", link: "https://leetcode.com/problems/valid-parentheses/" },
              { type: "practice", title: "LeetCode 739: Daily Temperatures", link: "https://leetcode.com/problems/daily-temperatures/" },
              { type: "practice", title: "LeetCode 84: Largest Rectangle in Histogram", link: "https://leetcode.com/problems/largest-rectangle-in-histogram/" }
            ]
          },
          {
            id: "dsa-sk-7",
            name: "Queue & Deque",
            desc: "FIFO queues, circular buffers, priority processing, and double-ended queues (deques) for sliding window maximum.",
            duration: "75 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Implemented double-ended buffer queues ensuring deterministic O(1) push and pop operations for streaming jobs.",
            resources: [
              { type: "notes", title: "takeUforward: Implement Queue & Sliding Window Maximum", link: "https://takeuforward.org/data-structure/sliding-window-maximum/" },
              { type: "practice", title: "LeetCode 232: Implement Queue using Stacks", link: "https://leetcode.com/problems/implement-queue-using-stacks/" },
              { type: "practice", title: "LeetCode 239: Sliding Window Maximum", link: "https://leetcode.com/problems/sliding-window-maximum/" }
            ]
          }
        ]
      },
      {
        id: "dsa-mod-4",
        number: 4,
        title: "Trees & Hierarchical Structures",
        skills: [
          {
            id: "dsa-sk-8",
            name: "Binary Tree",
            desc: "Recursive and iterative DFS traversals (In-order, Pre-order, Post-order), BFS level order, height, diameter, and tree paths.",
            duration: "100 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Refactored nested organizational hierarchy rendering using iterative tree traversals, eliminating call-stack overflow crashes.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's Binary Tree Playlist & Sheet", link: "https://takeuforward.org/data-structure/binary-tree/" },
              { type: "practice", title: "LeetCode 102: Binary Tree Level Order Traversal", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
              { type: "practice", title: "LeetCode 104: Maximum Depth of Binary Tree", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
              { type: "practice", title: "LeetCode 543: Diameter of Binary Tree", link: "https://leetcode.com/problems/diameter-of-binary-tree/" }
            ]
          },
          {
            id: "dsa-sk-9",
            name: "Binary Search Tree (BST)",
            desc: "BST ordering properties, logarithmic search, insertion, deletion, validate BST, and Lowest Common Ancestor (LCA).",
            duration: "85 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Engineered hierarchical taxonomy resolution utilizing Lowest Common Ancestor (LCA) algorithms with logarithmic depth lookups.",
            resources: [
              { type: "notes", title: "takeUforward: Binary Search Tree Comprehensive Sheet", link: "https://takeuforward.org/data-structure/binary-search-tree/" },
              { type: "practice", title: "LeetCode 98: Validate Binary Search Tree", link: "https://leetcode.com/problems/validate-binary-search-tree/" },
              { type: "practice", title: "LeetCode 235: Lowest Common Ancestor of a BST", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" }
            ]
          },
          {
            id: "dsa-sk-heap",
            name: "Heap / Priority Queue",
            desc: "Min-heap and max-heap array representations, heapify in O(n), top-K elements, and dynamic median tracking with two heaps.",
            duration: "90 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Constructed top-K real-time ranking engine utilizing min-heaps, reducing memory footprint by 80%.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's Heap Series & Priority Queue", link: "https://takeuforward.org/data-structure/heap/" },
              { type: "practice", title: "LeetCode 215: Kth Largest Element in an Array", link: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
              { type: "practice", title: "LeetCode 295: Find Median from Data Stream", link: "https://leetcode.com/problems/find-median-from-data-stream/" }
            ]
          },
          {
            id: "dsa-sk-10",
            name: "Trie (Prefix Tree)",
            desc: "N-ary tree structure for word dictionary insertion, prefix matching, auto-complete indexing, and bitwise XOR tries.",
            duration: "80 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Constructed in-memory prefix search engine using Trie data structures, delivering instant 3ms autocomplete suggestions across 100K terms.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's Trie Course & Practice", link: "https://takeuforward.org/data-structure/trie/" },
              { type: "practice", title: "LeetCode 208: Implement Trie (Prefix Tree)", link: "https://leetcode.com/problems/implement-trie-prefix-tree/" },
              { type: "practice", title: "LeetCode 211: Design Add and Search Words Data Structure", link: "https://leetcode.com/problems/design-add-and-search-words-data-structure/" }
            ]
          }
        ]
      },
      {
        id: "dsa-mod-5",
        number: 5,
        title: "Graph Algorithms",
        skills: [
          {
            id: "dsa-sk-11",
            name: "Graphs (BFS & DFS)",
            desc: "Adjacency list representation, Breadth-First and Depth-First Search on graphs and 2D grid matrices, connected components, and cycle detection.",
            duration: "110 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Modeled relational dependency graphs with breadth-first traversal routines, preventing circular deadlocks across async service tasks.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's Graph Series (BFS & DFS Sheet)", link: "https://takeuforward.org/data-structure/graph/" },
              { type: "practice", title: "LeetCode 200: Number of Islands", link: "https://leetcode.com/problems/number-of-islands/" },
              { type: "practice", title: "LeetCode 133: Clone Graph", link: "https://leetcode.com/problems/clone-graph/" }
            ]
          },
          {
            id: "dsa-sk-12",
            name: "Topological Sort",
            desc: "Directed Acyclic Graph (DAG) node ordering using Kahn's algorithm (in-degrees BFS) and DFS with visited tracking for dependency scheduling.",
            duration: "85 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Engineered build-task orchestrator utilizing Kahn's topological sorting algorithm to sequence parallel pipeline steps.",
            resources: [
              { type: "notes", title: "takeUforward: Topological Sort (Kahn's Algorithm & DFS)", link: "https://takeuforward.org/data-structure/topological-sort-bfs-kahns-algorithm/" },
              { type: "practice", title: "LeetCode 207: Course Schedule", link: "https://leetcode.com/problems/course-schedule/" },
              { type: "practice", title: "LeetCode 210: Course Schedule II", link: "https://leetcode.com/problems/course-schedule-ii/" }
            ]
          },
          {
            id: "dsa-sk-13",
            name: "Shortest Path (Dijkstra)",
            desc: "Dijkstra's priority-queue algorithm for non-negative weighted graphs, Bellman-Ford for negative weights, and Floyd-Warshall for all-pairs.",
            duration: "95 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Devised shortest-path routing mechanism utilizing Dijkstra's algorithm with min-heaps, reducing latency hops.",
            resources: [
              { type: "notes", title: "takeUforward: Dijkstra's Algorithm & Shortest Path Sheet", link: "https://takeuforward.org/data-structure/dijkstras-algorithm-using-set-and-priority-queue/" },
              { type: "practice", title: "LeetCode 743: Network Delay Time", link: "https://leetcode.com/problems/network-delay-time/" },
              { type: "practice", title: "LeetCode 787: Cheapest Flights Within K Stops", link: "https://leetcode.com/problems/cheapest-flights-within-k-stops/" }
            ]
          },
          {
            id: "dsa-sk-14",
            name: "Disjoint Set Union (Union-Find)",
            desc: "Near-constant amortized set union and find queries using path compression and union by rank for dynamic connectivity and Kruskal's MST.",
            duration: "80 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Deployed Union-Find data structures with path compression to calculate real-time network partition health in sub-millisecond cycles.",
            resources: [
              { type: "notes", title: "takeUforward: Disjoint Set (Union-Find) Complete Guide", link: "https://takeuforward.org/data-structure/disjoint-set-union-by-rank-union-by-size-path-compression-g-46/"},
              { type: "practice", title: "LeetCode 547: Number of Provinces", link: "https://leetcode.com/problems/number-of-provinces/" },
              { type: "practice", title: "LeetCode 684: Redundant Connection", link: "https://leetcode.com/problems/redundant-connection/" }
            ]
          }
        ]
      },
      {
        id: "dsa-mod-6",
        number: 6,
        title: "Dynamic Programming & Optimization",
        skills: [
          {
            id: "dsa-sk-17",
            name: "Recursion & Backtracking",
            desc: "Combinatorial state-space search, branch-and-bound pruning, subsets, combinations, permutations, and puzzle constraint solving.",
            duration: "95 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Engineered rule engine constraint validator using recursive backtracking with branch pruning, trimming evaluation paths by 70%.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's Recursion & Backtracking Series", link: "https://takeuforward.org/data-structure/recursion/" },
              { type: "practice", title: "LeetCode 78: Subsets", link: "https://leetcode.com/problems/subsets/" },
              { type: "practice", title: "LeetCode 46: Permutations", link: "https://leetcode.com/problems/permutations/" },
              { type: "practice", title: "LeetCode 51: N-Queens", link: "https://leetcode.com/problems/n-queens/" }
            ]
          },
          {
            id: "dsa-sk-15",
            name: "1D Dynamic Programming",
            desc: "Identifying overlapping subproblems and optimal substructures. Converting exponential recursive relations to linear state tabulation.",
            duration: "105 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Formulated dynamic programming models that optimized resource allocation schedules, replacing exponential recursive search with O(n) state transitions.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's Dynamic Programming Series", link: "https://takeuforward.org/data-structure/dynamic-programming/" },
              { type: "practice", title: "LeetCode 70: Climbing Stairs", link: "https://leetcode.com/problems/climbing-stairs/" },
              { type: "practice", title: "LeetCode 198: House Robber", link: "https://leetcode.com/problems/house-robber/" },
              { type: "practice", title: "LeetCode 322: Coin Change", link: "https://leetcode.com/problems/coin-change/" },
              { type: "practice", title: "LeetCode 300: Longest Increasing Subsequence", link: "https://leetcode.com/problems/longest-increasing-subsequence/" }
            ]
          },
          {
            id: "dsa-sk-16",
            name: "2D Dynamic Programming & Grids",
            desc: "Grid path counting, 0/1 Knapsack, unbounded knapsack, Longest Common Subsequence (LCS), and string edit distance state matrices.",
            duration: "110 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Created diff comparison engine using 2D Longest Common Subsequence (LCS) dynamic programming with space-optimized buffers.",
            resources: [
              { type: "notes", title: "takeUforward: 2D DP, Grid Problems & Knapsack Sheet", link: "https://takeuforward.org/data-structure/dynamic-programming-on-grids/" },
              { type: "practice", title: "LeetCode 62: Unique Paths", link: "https://leetcode.com/problems/unique-paths/" },
              { type: "practice", title: "LeetCode 1143: Longest Common Subsequence", link: "https://leetcode.com/problems/longest-common-subsequence/" },
              { type: "practice", title: "LeetCode 72: Edit Distance", link: "https://leetcode.com/problems/edit-distance/" }
            ]
          },
          {
            id: "dsa-sk-greedy",
            name: "Greedy Algorithms",
            desc: "Locally optimal choices leading to globally optimal solutions: interval scheduling, gas station routing, and greedy task completion.",
            duration: "80 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Engineered greedy task execution dispatcher maximizing throughput under variable execution deadlines.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's Greedy Algorithms Series", link: "https://takeuforward.org/data-structure/greedy-algorithm/" },
              { type: "practice", title: "LeetCode 55: Jump Game", link: "https://leetcode.com/problems/jump-game/" },
              { type: "practice", title: "LeetCode 134: Gas Station", link: "https://leetcode.com/problems/gas-station/" }
            ]
          },
          {
            id: "dsa-sk-bit",
            name: "Bit Manipulation",
            desc: "Bitwise AND, OR, XOR, shifts, two's complement, bit masks, power of two checks, and single number discovery.",
            duration: "60 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Implemented high-performance bitmask flags and bitwise permission validators.",
            resources: [
              { type: "notes", title: "takeUforward: Striver's Bit Manipulation Course", link: "https://takeuforward.org/data-structure/bit-manipulation/" },
              { type: "practice", title: "LeetCode 136: Single Number", link: "https://leetcode.com/problems/single-number/" },
              { type: "practice", title: "LeetCode 191: Number of 1 Bits", link: "https://leetcode.com/problems/number-of-1-bits/" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "fullstack",
    roleTitle: "Full Stack & Frontend Engineer (React / Next.js)",
    category: "Web Development",
    tagline: "Build production-grade web applications with modern TypeScript, React 19, server actions, and cloud databases.",
    totalHours: "42 hours",
    externalRoadmapUrl: "https://roadmap.sh/full-stack",
    externalRoadmapLabel: "roadmap.sh / Full Stack",
    secondaryRoadmapUrl: "https://roadmap.sh/frontend",
    secondaryRoadmapLabel: "roadmap.sh / Frontend",
    modules: [
      {
        id: "fs-mod-1",
        number: 1,
        title: "Modern TypeScript & Framework Architecture",
        skills: [
          {
            id: "fs-sk-1",
            name: "Advanced TypeScript, Generics & Strict Typing",
            desc: "Master conditional types, branded types, infer keyword, mapped types, and zero-any type safety for enterprise codebases.",
            duration: "75 min",
            difficulty: "Intermediate",
            completed: true,
            portfolioBullet: "Established end-to-end type safety across 45,000 LOC using strict TypeScript compiler settings, eliminating runtime type casting errors.",
            resources: [
              { type: "video", title: "Advanced TypeScript Course (Matt Pocock / Total TypeScript)", link: "https://www.totaltypescript.com/tutorials" },
              { type: "notes", title: "Official TypeScript Handbook", link: "https://www.typescriptlang.org/docs/handbook/intro.html" },
              { type: "practice", title: "Type Challenges GitHub Practice Suite", link: "https://github.com/type-challenges/type-challenges" }
            ]
          },
          {
            id: "fs-sk-2",
            name: "React Server Components & Next.js App Router",
            desc: "Streaming SSR, async Server Components, Route Handlers, Suspense boundaries, and Parallel/Intercepting Routes.",
            duration: "90 min",
            difficulty: "Advanced",
            completed: true,
            portfolioBullet: "Migrated legacy SPA to Next.js App Router with React Server Components, improving First Contentful Paint (FCP) by 54%.",
            resources: [
              { type: "video", title: "Next.js App Router Masterclass (Lee Robinson / Vercel)", link: "https://www.youtube.com/watch?v=wm5gMKuwSYk" },
              { type: "notes", title: "Next.js Official Documentation", link: "https://nextjs.org/docs" },
              { type: "practice", title: "Build a Full-Stack CRUD Application with Server Actions", link: "https://github.com/vercel/next.js/tree/canary/examples" }
            ]
          },
          {
            id: "fs-sk-3",
            name: "Core Web Vitals & Frontend Performance Optimization",
            desc: "Optimize LCP, INP, and CLS via code-splitting, dynamic imports, image optimization, font preloading, and bundle auditing.",
            duration: "80 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Raised Google Lighthouse performance score from 62 to 98 by eliminating layout shifts (CLS < 0.02) and deferring third-party scripts.",
            resources: [
              { type: "video", title: "Mastering Core Web Vitals (Chrome for Developers)", link: "https://www.youtube.com/watch?v=AQqIZn3KA9Q" },
              { type: "notes", title: "web.dev: Optimize Largest Contentful Paint (LCP)", link: "https://web.dev/articles/optimize-lcp" },
              { type: "practice", title: "Audit & Optimize a Next.js Bundle with @next/bundle-analyzer", link: "https://www.npmjs.com/package/@next/bundle-analyzer" }
            ]
          }
        ]
      },
      {
        id: "fs-mod-2",
        number: 2,
        title: "Client State, Server State & APIs",
        skills: [
          {
            id: "fs-sk-4",
            name: "Server State Synchronization with TanStack Query / SWR",
            desc: "Handle background revalidation, optimistic UI updates, request deduplication, and infinite scrolling pagination.",
            duration: "85 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Integrated TanStack Query for server state management, delivering optimistic UI rollbacks and reducing redundant API hits by 48%.",
            resources: [
              { type: "video", title: "TanStack Query v5 Complete Course (TkDodo)", link: "https://www.youtube.com/watch?v=novnyCaa7To" },
              { type: "notes", title: "Practical React Query (TkDodo Blog)", link: "https://tkdodo.eu/blog/practical-react-query" },
              { type: "practice", title: "Implement Infinite Query Pagination with Virtualized Lists", link: "https://tanstack.com/query/latest/docs/framework/react/examples/infinite-query" }
            ]
          },
          {
            id: "fs-sk-5",
            name: "RESTful API Architecture & OpenAPI Specifications",
            desc: "Design clean REST interfaces, status code conventions, idempotency keys, rate limit headers, and Swagger documentation.",
            duration: "70 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Designed production RESTful API handling 1M+ daily calls, conforming to OpenAPI 3.0 specs with automated SDK codegen.",
            resources: [
              { type: "video", title: "REST API Design Best Practices (freeCodeCamp)", link: "https://www.youtube.com/watch?v=-MTSQjw5DrM" },
              { type: "notes", title: "Microsoft REST API Guidelines", link: "https://github.com/microsoft/api-guidelines" },
              { type: "practice", title: "Validate API payloads using Zod runtime schemas", link: "https://zod.dev" }
            ]
          },
          {
            id: "fs-sk-6",
            name: "GraphQL Schema Design & Apollo / URQL Clients",
            desc: "Formulate schemas, resolvers, queries, mutations, and DataLoader patterns to eliminate N+1 database queries.",
            duration: "90 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Consolidated 8 separate microservice endpoints into a unified GraphQL gateway with batch DataLoader resolvers.",
            resources: [
              { type: "video", title: "GraphQL Full Course for Beginners (freeCodeCamp)", link: "https://www.youtube.com/watch?v=ed8SzALpx1Q" },
              { type: "notes", title: "Official GraphQL Documentation", link: "https://graphql.org/learn/" },
              { type: "practice", title: "Solve N+1 Query Problem with DataLoader", link: "https://github.com/graphql/dataloader" }
            ]
          }
        ]
      },
      {
        id: "fs-mod-3",
        number: 3,
        title: "Databases, Cloud Storage & Auth",
        skills: [
          {
            id: "fs-sk-7",
            name: "PostgreSQL Schema Design, Foreign Keys & Indexes",
            desc: "Normalize relational schemas (3NF), design composite indexes, set cascade rules, and write complex JOIN queries.",
            duration: "100 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Architected PostgreSQL schemas with composite B-Tree indexes, improving query response times by 38% under 200 concurrent connections.",
            resources: [
              { type: "video", title: "PostgreSQL Tutorial for Beginners (Hussein Nasser)", link: "https://www.youtube.com/watch?v=qw--VYLpxG4" },
              { type: "notes", title: "PostgreSQL Official Documentation", link: "https://www.postgresql.org/docs/" },
              { type: "practice", title: "SQLBolt: Interactive SQL Tutorials", link: "https://sqlbolt.com/" }
            ]
          },
          {
            id: "fs-sk-8",
            name: "Authentication & Authorization (OAuth 2.0, JWT & Sessions)",
            desc: "Implement secure HttpOnly cookie sessions, OAuth 2.0 Google/GitHub sign-in, CSRF defense, and Role-Based Access Control (RBAC).",
            duration: "95 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Implemented passwordless OAuth 2.0 authentication with cryptographically signed HttpOnly JWT session cookies.",
            resources: [
              { type: "video", title: "OAuth 2.0 and OpenID Connect Explained (Okta)", link: "https://www.youtube.com/watch?v=996OiexHze0" },
              { type: "notes", title: "OWASP Session Management Cheat Sheet", link: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
              { type: "practice", title: "Configure Supabase Auth or NextAuth.js with Protected Middleware", link: "https://authjs.dev" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "devops",
    roleTitle: "DevOps, Cloud & Platform Engineer",
    category: "Cloud & Infrastructure",
    tagline: "Deploy resilient Kubernetes clusters, automate infrastructure with Terraform, and build zero-downtime CI/CD pipelines.",
    totalHours: "45 hours",
    externalRoadmapUrl: "https://roadmap.sh/devops",
    externalRoadmapLabel: "roadmap.sh / DevOps",
    secondaryRoadmapUrl: "https://roadmap.sh/docker",
    secondaryRoadmapLabel: "roadmap.sh / Docker",
    modules: [
      {
        id: "dev-mod-1",
        number: 1,
        title: "Linux Systems, Shell & Networking",
        skills: [
          {
            id: "dev-sk-1",
            name: "Linux File Systems, Permissions & Process Management",
            desc: "Master systemd service units, cron jobs, top/htop/vmstat diagnostics, file descriptors, and user permission models.",
            duration: "90 min",
            difficulty: "Beginner",
            completed: true,
            portfolioBullet: "Automated production Linux server provisioning and health daemon monitoring with custom systemd service units.",
            resources: [
              { type: "video", title: "Linux for Beginners Full Course (freeCodeCamp)", link: "https://www.youtube.com/watch?v=sWbGOq-8Nqw" },
              { type: "notes", title: "The Linux Command Line (William Shotts)", link: "https://linuxcommand.org/tlcl.php" },
              { type: "practice", title: "OverTheWire: Bandit Wargame for Linux CLI Mastery", link: "https://overthewire.org/wargames/bandit/" }
            ]
          },
          {
            id: "dev-sk-2",
            name: "Networking Fundamentals: TCP/IP, DNS & Reverse Proxies",
            desc: "Configure Nginx reverse proxies, SSL/TLS certificates via Let's Encrypt, HTTP/2 multiplexing, and iptables firewalls.",
            duration: "100 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Configured Nginx reverse proxies with SSL termination and keepalive connection pooling, cutting TLS handshake latency by 40%.",
            resources: [
              { type: "video", title: "Computer Networking Course (freeCodeCamp)", link: "https://www.youtube.com/watch?v=IPvYjXCsTg8" },
              { type: "notes", title: "Nginx Beginners Guide", link: "https://nginx.org/en/docs/beginners_guide.html" },
              { type: "practice", title: "Configure Nginx Reverse Proxy with Docker Compose", link: "https://github.com" }
            ]
          }
        ]
      },
      {
        id: "dev-mod-2",
        number: 2,
        title: "Containers & Kubernetes Orchestration",
        skills: [
          {
            id: "dev-sk-3",
            name: "Docker Multi-Stage Builds & Container Security",
            desc: "Write lightweight Alpine/Distroless Dockerfiles, utilize build caches, run as non-root users, and scan CVEs with Trivy.",
            duration: "85 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Reduced production Docker image sizes from 1.2GB to 85MB using multi-stage builds and non-root Distroless base containers.",
            resources: [
              { type: "video", title: "Docker Tutorial for Beginners (TechWorld with Nana)", link: "https://www.youtube.com/watch?v=3c-iBn73dDE" },
              { type: "notes", title: "Docker Best Practices Guide", link: "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/" },
              { type: "practice", title: "Scan images for vulnerabilities with Aqua Trivy", link: "https://github.com/aquasecurity/trivy" }
            ]
          },
          {
            id: "dev-sk-4",
            name: "Kubernetes Deployments, Services & Ingress Controllers",
            desc: "Orchestrate Pods, ReplicaSets, Deployments, ClusterIP/NodePort/LoadBalancer Services, and ingress routing via Traefik or Nginx.",
            duration: "130 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Orchestrated 40+ microservices on AWS EKS with automated Horizontal Pod Autoscaling (HPA) handling peak traffic surges.",
            resources: [
              { type: "video", title: "Kubernetes Course for Beginners (TechWorld with Nana)", link: "https://www.youtube.com/watch?v=X48VuDVv0do" },
              { type: "notes", title: "Official Kubernetes Concepts Documentation", link: "https://kubernetes.io/docs/concepts/" },
              { type: "practice", title: "Killercoda: Free Interactive Kubernetes Sandbox", link: "https://killercoda.com/playgrounds/scenario/kubernetes" }
            ]
          }
        ]
      },
      {
        id: "dev-mod-3",
        number: 3,
        title: "Infrastructure as Code & Observability",
        skills: [
          {
            id: "dev-sk-5",
            name: "Terraform Modules, State Management & Cloud Provisioning",
            desc: "Provision AWS VPCs, Subnets, EC2, and S3 using modular Terraform code, remote S3 state locks with DynamoDB, and workspaces.",
            duration: "110 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Codified cloud infrastructure using reusable Terraform modules with S3 remote state locking, eliminating configuration drift.",
            resources: [
              { type: "video", title: "Terraform Course - Automate Your AWS Cloud Infrastructure (freeCodeCamp)", link: "https://www.youtube.com/watch?v=SLB_c_ayRMo" },
              { type: "notes", title: "HashiCorp Terraform Documentation", link: "https://developer.hashicorp.com/terraform/docs" },
              { type: "practice", title: "Terraform AWS Boilerplate on GitHub", link: "https://github.com/terraform-aws-modules" }
            ]
          },
          {
            id: "dev-sk-6",
            name: "Observability: Prometheus Metrics & Grafana Dashboards",
            desc: "Instrument Node.js/Go apps with Prometheus client metrics, configure alert rules, and build Grafana latency and error-rate dashboards.",
            duration: "95 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Built real-time Grafana telemetry dashboards tracking P99 request latencies and SLA burn rates with PagerDuty integration.",
            resources: [
              { type: "video", title: "Prometheus and Grafana Setup Guide (TechWorld with Nana)", link: "https://www.youtube.com/watch?v=h4Sl21AKiDg" },
              { type: "notes", title: "Prometheus Overview Documentation", link: "https://prometheus.io/docs/introduction/overview/" },
              { type: "practice", title: "Setup Prometheus node_exporter with Docker Compose", link: "https://github.com/prometheus/node_exporter" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "ai-ml",
    roleTitle: "Data Scientist & Machine Learning Engineer",
    category: "Data & AI",
    tagline: "Train predictive ML models, fine-tune LLMs, build RAG pipelines, and deploy models with FastAPI and Docker.",
    totalHours: "50 hours",
    externalRoadmapUrl: "https://roadmap.sh/ai-data-scientist",
    externalRoadmapLabel: "roadmap.sh / AI & Data Science",
    secondaryRoadmapUrl: "https://roadmap.sh/python",
    secondaryRoadmapLabel: "roadmap.sh / Python",
    modules: [
      {
        id: "ml-mod-1",
        number: 1,
        title: "Python Data Foundations & Statistical Modeling",
        skills: [
          {
            id: "ml-sk-1",
            name: "Vectorized Computations with NumPy & Pandas",
            desc: "Master multidimensional slicing, broadcasting, dataframe indexing, group-by aggregation, and handling sparse datasets.",
            duration: "85 min",
            difficulty: "Beginner",
            completed: true,
            portfolioBullet: "Optimized feature aggregation pipelines with vectorized NumPy array broadcasting, slashing processing time by 82%.",
            resources: [
              { type: "video", title: "Python for Data Analysis Full Course (freeCodeCamp)", link: "https://www.youtube.com/watch?v=r-uOLxNrNk8" },
              { type: "notes", title: "Pandas User Guide & Cookbook", link: "https://pandas.pydata.org/docs/user_guide/index.html" },
              { type: "practice", title: "Kaggle: Pandas Micro-Course", link: "https://www.kaggle.com/learn/pandas" }
            ]
          },
          {
            id: "ml-sk-2",
            name: "Feature Engineering & Scikit-Learn Classifiers",
            desc: "One-hot encoding, imputation, StandardScaler, polynomial features, Logistic Regression, Random Forests, and XGBoost.",
            duration: "110 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Engineered XGBoost churn prediction model with cross-validated hyperparameter tuning, achieving an 0.89 ROC-AUC score.",
            resources: [
              { type: "video", title: "Machine Learning with Python and Scikit-Learn (StatQuest)", link: "https://www.youtube.com/watch?v=Gv9_4yMHFhI" },
              { type: "notes", title: "Scikit-Learn Official User Guide", link: "https://scikit-learn.org/stable/user_guide.html" },
              { type: "practice", title: "Kaggle Titanic & House Prices Competitions", link: "https://www.kaggle.com/c/titanic" }
            ]
          }
        ]
      },
      {
        id: "ml-mod-2",
        number: 2,
        title: "Deep Learning & Modern LLM Architectures",
        skills: [
          {
            id: "ml-sk-3",
            name: "Neural Networks with PyTorch & Backpropagation",
            desc: "Build custom nn.Module classes, autograd forward/backward passes, DataLoader batches, and GPU acceleration with CUDA.",
            duration: "130 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Trained deep learning classification networks in PyTorch using mixed-precision CUDA acceleration, reducing epoch runtime by 35%.",
            resources: [
              { type: "video", title: "PyTorch for Deep Learning Bootcamp (freeCodeCamp)", link: "https://www.youtube.com/watch?v=V_xro1bcAuA" },
              { type: "notes", title: "PyTorch Official Tutorials & Recipes", link: "https://pytorch.org/tutorials/" },
              { type: "practice", title: "Build an Image Classifier on CIFAR-10 Dataset", link: "https://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html" }
            ]
          },
          {
            id: "ml-sk-4",
            name: "Retrieval-Augmented Generation (RAG) & Vector Databases",
            desc: "Chunk documents, generate OpenAI/Gemini embeddings, store in Pinecone/pgvector, and build semantic hybrid search workflows.",
            duration: "105 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Architected enterprise RAG system with pgvector and hybrid keyword-semantic search, answering domain inquiries with 94% citation accuracy.",
            resources: [
              { type: "video", title: "RAG from Scratch Course (LangChain)", link: "https://www.youtube.com/watch?v=wd7TZ4w1mSw" },
              { type: "notes", title: "Pinecone: What is Vector Search?", link: "https://www.pinecone.io/learn/vector-search-basics/" },
              { type: "practice", title: "Build a Document Q&A Bot with LangChain and LlamaIndex", link: "https://github.com/run-llama/llama_index" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "product-manager",
    roleTitle: "Product Manager & Technical PM",
    category: "Product & Strategy",
    tagline: "Drive product discovery, write engineering-ready PRDs, conduct A/B experiments, and align cross-functional teams.",
    totalHours: "32 hours",
    externalRoadmapUrl: "https://roadmap.sh/product-manager",
    externalRoadmapLabel: "roadmap.sh / Product Manager",
    modules: [
      {
        id: "pm-mod-1",
        number: 1,
        title: "Product Strategy & Customer Discovery",
        skills: [
          {
            id: "pm-sk-1",
            name: "Customer Discovery & The Mom Test Interviews",
            desc: "Formulate non-leading interview questions, synthesize qualitative feedback into user personas, and validate willingness to pay.",
            duration: "75 min",
            difficulty: "Beginner",
            completed: true,
            portfolioBullet: "Conducted 45+ structured customer interviews using Mom Test principles to validate problem-solution fit for a $1.2M ARR product expansion.",
            resources: [
              { type: "video", title: "How to Talk to Users (Y Combinator / Michael Seibel)", link: "https://www.youtube.com/watch?v=qQZZBPn56S0" },
              { type: "notes", title: "The Mom Test Summary & Cheat Sheet", link: "https://www.momtestbook.com" },
              { type: "practice", title: "Write an Interview Script & Customer Synthesis Grid", link: "https://coda.io" }
            ]
          },
          {
            id: "pm-sk-2",
            name: "Product Opportunity Trees & Value Proposition Canvas",
            desc: "Map overarching business goals into distinct opportunity branches, testable hypotheses, and feature experiments.",
            duration: "70 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Structured multi-quarter roadmap using Teresa Torres Opportunity Solution Trees, aligning design and engineering to North Star KPIs.",
            resources: [
              { type: "video", title: "Opportunity Solution Trees Explained (Teresa Torres)", link: "https://www.youtube.com/watch?v=JmU8hZ4W7s4" },
              { type: "notes", title: "Product Talk: Continuous Discovery Habits", link: "https://www.producttalk.org/" },
              { type: "practice", title: "Map an Opportunity Solution Tree for a SaaS Onboarding Flow", link: "https://miro.com" }
            ]
          }
        ]
      },
      {
        id: "pm-mod-2",
        number: 2,
        title: "Execution, PRDs & Experimentation",
        skills: [
          {
            id: "pm-sk-3",
            name: "Writing Engineering-Ready Product Requirements (PRDs)",
            desc: "Define problem context, measurable success metrics, user stories, acceptance criteria, edge cases, and out-of-scope boundaries.",
            duration: "85 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Authored 12 end-to-end PRDs adopted by 3 engineering squads with zero scope churn during bi-weekly sprint deliveries.",
            resources: [
              { type: "video", title: "How to Write a World-Class PRD (Lenny Rachitsky & Kevin Yien)", link: "https://www.youtube.com/watch?v=cO6E3uR-fQk" },
              { type: "notes", title: "Figma PRD Template & Guidelines", link: "https://www.lennysnewsletter.com/p/my-favorite-templates-issue-37" },
              { type: "practice", title: "Draft a PRD for a One-Click Payment Feature", link: "https://notion.so" }
            ]
          },
          {
            id: "pm-sk-4",
            name: "A/B Experimentation & Funnel Telemetry Analysis",
            desc: "Set sample sizes, calculate minimum detectable effect (MDE), prevent p-hacking, and analyze Mixpanel/Amplitude funnel drops.",
            duration: "90 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Designed statistical A/B experimentation framework in Amplitude, discovering friction points that boosted visitor-to-paid conversions by 18%.",
            resources: [
              { type: "video", title: "A/B Testing Course - Udacity / Google", link: "https://www.udacity.com/course/ab-testing--ud257" },
              { type: "notes", title: "Optimizely: Sample Size Calculator & Stat Engine Guide", link: "https://www.optimizely.com/sample-size-calculator/" },
              { type: "practice", title: "Analyze an A/B test dataset with Python or SQL", link: "https://kaggle.com" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "ui-ux",
    roleTitle: "Product Designer & UI/UX Specialist",
    category: "Design",
    tagline: "Craft intuitive design systems, conduct usability tests, and build pixel-perfect prototypes in Figma.",
    totalHours: "34 hours",
    externalRoadmapUrl: "https://roadmap.sh/ux-design",
    externalRoadmapLabel: "roadmap.sh / UX Design",
    modules: [
      {
        id: "ux-mod-1",
        number: 1,
        title: "Design Systems & Component Tokens",
        skills: [
          {
            id: "ux-sk-1",
            name: "Figma Variables, Design Tokens & Auto Layout 5.0",
            desc: "Master nested component variants, boolean component properties, responsive constraints, and cross-platform token architectures.",
            duration: "90 min",
            difficulty: "Intermediate",
            completed: true,
            portfolioBullet: "Engineered scalable Figma design system with 250+ tokens and variants, accelerating cross-functional feature delivery by 35%.",
            resources: [
              { type: "video", title: "Figma Variables & Advanced Auto Layout (Figma Official)", link: "https://www.youtube.com/watch?v=J95H2bK_8vM" },
              { type: "notes", title: "Tokens Studio for Figma Documentation", link: "https://docs.tokens.studio/" },
              { type: "practice", title: "Build a Multi-Theme Design System in Figma", link: "https://www.figma.com/community" }
            ]
          },
          {
            id: "ux-sk-2",
            name: "WCAG 2.2 Accessibility & Contrast Standards",
            desc: "Ensure 4.5:1 contrast ratios for text, accessible focus states, keyboard navigation compatibility, and screen reader labels.",
            duration: "75 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Audited enterprise web portal for WCAG 2.2 AAA accessibility compliance, resolving 40+ contrast and aria-label deficiencies.",
            resources: [
              { type: "video", title: "Web Accessibility (A11y) Full Course (Google Chrome Developers)", link: "https://www.youtube.com/watch?v=z8xUCzToff8" },
              { type: "notes", title: "W3C Web Content Accessibility Guidelines (WCAG) 2.2", link: "https://www.w3.org/TR/WCAG22/" },
              { type: "practice", title: "Audit Figma layouts with Stark Accessibility Plugin", link: "https://www.getstark.co/" }
            ]
          }
        ]
      },
      {
        id: "ux-mod-2",
        number: 2,
        title: "Usability Testing & Case Studies",
        skills: [
          {
            id: "ux-sk-3",
            name: "Moderated & Unmoderated Usability Testing",
            desc: "Formulate task scripts, execute tests via Maze/UserTesting, identify usability friction, and calculate System Usability Scale (SUS).",
            duration: "85 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Moderated 20 usability testing rounds on mobile prototypes, deriving insights that reduced checkout abandonment by 24%.",
            resources: [
              { type: "video", title: "How to Run a Usability Test (Nielsen Norman Group)", link: "https://www.youtube.com/watch?v=1UhaWl0Z4vQ" },
              { type: "notes", title: "NN/g: Usability 101 - Introduction to Usability", link: "https://www.nngroup.com/articles/usability-101-introduction-to-usability/" },
              { type: "practice", title: "Setup an Unmoderated Usability Study on Maze", link: "https://maze.co/" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "cybersecurity",
    roleTitle: "Cybersecurity & InfoSec Analyst",
    category: "Security & IT",
    tagline: "Analyze threat telemetry with SIEM, contain intrusions, conduct vulnerability assessments, and apply NIST frameworks.",
    totalHours: "40 hours",
    externalRoadmapUrl: "https://roadmap.sh/cyber-security",
    externalRoadmapLabel: "roadmap.sh / Cyber Security",
    modules: [
      {
        id: "sec-mod-1",
        number: 1,
        title: "Network Security & Packet Inspection",
        skills: [
          {
            id: "sec-sk-1",
            name: "Wireshark Packet Analysis & Protocol Dissection",
            desc: "Inspect PCAP captures, identify abnormal TCP SYN flood handshakes, analyze unencrypted DNS queries, and detect ARP poisoning.",
            duration: "95 min",
            difficulty: "Intermediate",
            completed: true,
            portfolioBullet: "Conducted deep packet inspection using Wireshark to isolate network intrusion anomalies, reducing triage turnaround by 45%.",
            resources: [
              { type: "video", title: "Wireshark Tutorial for Beginners (NetworkChuck)", link: "https://www.youtube.com/watch?v=lb1Dw0elw0Q" },
              { type: "notes", title: "Wireshark Official User's Guide", link: "https://www.wireshark.org/docs/wsug_html_chunked/" },
              { type: "practice", title: "Malware-Traffic-Analysis.net Real PCAP Exercises", link: "https://www.malware-traffic-analysis.net/" }
            ]
          },
          {
            id: "sec-sk-2",
            name: "SIEM Engineering & Threat Hunting with Splunk",
            desc: "Ingest Windows Event Logs, write Splunk Search Processing Language (SPL) queries, and configure automated alert triggers.",
            duration: "110 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Authored 30+ custom Splunk detection rules mapped to MITRE ATT&CK techniques, catching lateral movement attempts within minutes.",
            resources: [
              { type: "video", title: "Splunk for Beginners Full Course (freeCodeCamp)", link: "https://www.youtube.com/watch?v=tI4M4N-u48U" },
              { type: "notes", title: "Splunk Search Processing Language (SPL) Reference", link: "https://docs.splunk.com/Documentation/Splunk/latest/SearchReference" },
              { type: "practice", title: "TryHackMe: Splunk Rooms & SOC Analyst Path", link: "https://tryhackme.com/path/outline/soclevel1" }
            ]
          }
        ]
      },
      {
        id: "sec-mod-2",
        number: 2,
        title: "Vulnerability Management & Compliance",
        skills: [
          {
            id: "sec-sk-3",
            name: "NIST Cybersecurity Framework (CSF) & SOC 2 Compliance",
            desc: "Map controls across Identify, Protect, Detect, Respond, and Recover tiers; enforce least-privilege IAM and audit logging.",
            duration: "80 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Guided organization through SOC 2 Type II audit readiness, implementing continuous IAM policy checks and MFA enforcement.",
            resources: [
              { type: "video", title: "NIST Cybersecurity Framework Explained (Simplilearn)", link: "https://www.youtube.com/watch?v=0hWq5UfU_Xk" },
              { type: "notes", title: "NIST CSF 2.0 Official Documentation", link: "https://www.nist.gov/cyberframework" },
              { type: "practice", title: "Conduct a CIS Benchmark Audit on a Linux Host", link: "https://www.cisecurity.org/cis-benchmarks" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "backend-distributed",
    roleTitle: "Backend & Distributed Systems Engineer",
    category: "Backend Engineering",
    tagline: "High-throughput APIs, distributed caching with Redis, message queues (Kafka), and database consistency.",
    totalHours: "44 hours",
    externalRoadmapUrl: "https://roadmap.sh/backend",
    externalRoadmapLabel: "roadmap.sh / Backend",
    secondaryRoadmapUrl: "https://roadmap.sh/system-design",
    secondaryRoadmapLabel: "roadmap.sh / System Design",
    modules: [
      {
        id: "be-mod-1",
        number: 1,
        title: "High-Throughput Concurrency & I/O Models",
        skills: [
          {
            id: "be-sk-1",
            name: "Event Loop, Async I/O & Thread Pools",
            desc: "Master non-blocking I/O event loops (Node.js libuv / Go goroutines), worker threads, and thread-safe concurrency primitives.",
            duration: "90 min",
            difficulty: "Intermediate",
            completed: true,
            portfolioBullet: "Engineered non-blocking worker pools processing 12,000 asynchronous background jobs/sec with zero thread-starvation deadlocks.",
            resources: [
              { type: "video", title: "Node.js Event Loop Deep Dive (Bert Belder)", link: "https://www.youtube.com/watch?v=PNa9OMajw9w" },
              { type: "notes", title: "Go Concurrency Patterns & Goroutines", link: "https://go.dev/blog/pipelines" },
              { type: "practice", title: "Build a Concurrency-Safe In-Memory Cache with Locks", link: "https://github.com" }
            ]
          },
          {
            id: "be-sk-2",
            name: "Distributed Caching Strategies with Redis",
            desc: "Cache-Aside, Write-Through, Write-Behind patterns, Redis Sentinel/Cluster, eviction policies (LRU/LFU), and stampede prevention.",
            duration: "100 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Integrated distributed Redis cluster with probabilistic cache-stampede locking, trimming database read query volume by 65%.",
            resources: [
              { type: "video", title: "Redis System Design Tutorial (Hussein Nasser)", link: "https://www.youtube.com/watch?v=G1rO4SFLTew" },
              { type: "notes", title: "Redis University: Cache-Aside Architecture", link: "https://university.redis.com/" },
              { type: "practice", title: "Implement Distributed Locks with Redlock Algorithm", link: "https://redis.io/docs/manual/patterns/distributed-locks/" }
            ]
          }
        ]
      },
      {
        id: "be-mod-2",
        number: 2,
        title: "Event-Driven Systems & Database Scaling",
        skills: [
          {
            id: "be-sk-3",
            name: "Message Brokers & Event Streaming (Kafka / RabbitMQ)",
            desc: "Partitioning keys, consumer groups, offset management, delivery guarantees (At-Least-Once, Exactly-Once), and dead letter queues.",
            duration: "120 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Designed distributed Kafka event pipeline with partitioned consumer groups handling 45M daily state mutation messages.",
            resources: [
              { type: "video", title: "Apache Kafka Full Course (freeCodeCamp)", link: "https://www.youtube.com/watch?v=R873BlNVUB4" },
              { type: "notes", title: "Confluent Kafka Architecture Fundamentals", link: "https://developer.confluent.io/learn/kafka-internals/" },
              { type: "practice", title: "Setup Local Kafka Cluster with Docker and Produce/Consume Events", link: "https://github.com/confluentinc/cp-all-in-one" }
            ]
          },
          {
            id: "be-sk-4",
            name: "Database Sharding, Replication & Distributed Transactions",
            desc: "Read replicas, connection pooling with PgBouncer, horizontal sharding keys, and Saga Pattern vs Two-Phase Commit (2PC).",
            duration: "115 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Implemented Saga orchestrator for multi-service financial transfers, ensuring eventual consistency and automated compensating transactions.",
            resources: [
              { type: "video", title: "Database Sharding and Partitioning (Hussein Nasser)", link: "https://www.youtube.com/watch?v=0kGyd1_5Rps" },
              { type: "notes", title: "Designing Data-Intensive Applications (Martin Kleppmann Notes)", link: "https://dataintensive.net/" },
              { type: "practice", title: "Simulate Saga Pattern for Distributed Order Fulfillment", link: "https://microservices.io/patterns/data/saga.html" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "data-engineer",
    roleTitle: "Data Engineer & Analytics Specialist",
    category: "Data Engineering",
    tagline: "Build scalable ETL/ELT pipelines, manage cloud warehouses (Snowflake/BigQuery), and write Spark & dbt jobs.",
    totalHours: "46 hours",
    externalRoadmapUrl: "https://roadmap.sh/data-engineer",
    externalRoadmapLabel: "roadmap.sh / Data Engineer",
    secondaryRoadmapUrl: "https://roadmap.sh/postgresql-dba",
    secondaryRoadmapLabel: "roadmap.sh / PostgreSQL",
    modules: [
      {
        id: "de-mod-1",
        number: 1,
        title: "Advanced SQL & Dimensional Data Modeling",
        skills: [
          {
            id: "de-sk-1",
            name: "SQL Window Functions, CTEs & Query Optimization",
            desc: "Master ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, cumulative sums, recursive CTEs, and partition-level execution plans.",
            duration: "90 min",
            difficulty: "Intermediate",
            completed: true,
            portfolioBullet: "Refactored multi-stage analytical queries using optimized recursive CTEs and windowing, slashing warehouse credit consumption by 42%.",
            resources: [
              { type: "video", title: "Advanced SQL Window Functions Tutorial (Luke Barousse)", link: "https://www.youtube.com/watch?v=Ww71knvhQ-s" },
              { type: "notes", title: "Mode Analytics: SQL Window Functions Guide", link: "https://mode.com/sql-tutorial/sql-window-functions/" },
              { type: "practice", title: "LeetCode Database Hard Problems (Window Functions)", link: "https://leetcode.com/problemset/database/" }
            ]
          },
          {
            id: "de-sk-2",
            name: "Dimensional Modeling: Kimball Star & Snowflake Schemas",
            desc: "Design Fact tables, Slowly Changing Dimensions (SCD Type 1, 2, 3), surrogate keys, and conformed dimensions for analytics.",
            duration: "100 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Architected enterprise Kimball dimensional data warehouse with SCD Type 2 tracking across 5M customer records.",
            resources: [
              { type: "video", title: "Dimensional Modeling 101 (Seattle Data Guy)", link: "https://www.youtube.com/watch?v=Zf_x5jK9v7U" },
              { type: "notes", title: "The Data Warehouse Toolkit (Ralph Kimball Reference)", link: "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/" },
              { type: "practice", title: "Model an E-commerce Orders Star Schema with dbt", link: "https://www.getdbt.com/" }
            ]
          }
        ]
      },
      {
        id: "de-mod-2",
        number: 2,
        title: "Distributed Data Processing & Orchestration",
        skills: [
          {
            id: "de-sk-3",
            name: "Apache Spark / PySpark Distributed Transformations",
            desc: "DataFrames, Resilient Distributed Datasets (RDDs), Catalyst Optimizer, shuffling bottlenecks, partition pruning, and broadcast joins.",
            duration: "130 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Engineered PySpark batch ingestion processing 500GB daily log files with broadcast hash joins, eliminating memory spill bottlenecks.",
            resources: [
              { type: "video", title: "PySpark Tutorial for Beginners (freeCodeCamp)", link: "https://www.youtube.com/watch?v=_C8kWso4ne4" },
              { type: "notes", title: "Apache Spark Official Documentation", link: "https://spark.apache.org/docs/latest/" },
              { type: "practice", title: "Run Local PySpark Jobs with Docker Container", link: "https://hub.docker.com/r/apache/spark" }
            ]
          },
          {
            id: "de-sk-4",
            name: "Pipeline Orchestration with Apache Airflow & DAGs",
            desc: "Write Python DAGs, configure TaskFlow API, handle backfilling, dynamic task mapping, SLAs, and custom operators.",
            duration: "110 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Built production Apache Airflow orchestration orchestrating 80+ daily scheduled ETL DAGs with automated retry escalations.",
            resources: [
              { type: "video", title: "Apache Airflow Hands-on Course (Marc Lamberti)", link: "https://www.youtube.com/watch?v=K9AnJ9_ZAXE" },
              { type: "notes", title: "Astronomer Airflow Guides", link: "https://www.astronomer.io/docs/learn/" },
              { type: "practice", title: "Spin up Airflow via Astro CLI or Docker Compose", link: "https://airflow.apache.org/docs/apache-airflow/stable/howto/docker-compose/index.html" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "mobile-engineer",
    roleTitle: "Mobile Application Engineer (iOS & React Native)",
    category: "Mobile Development",
    tagline: "Build fluid, offline-first mobile apps for iOS and Android with high FPS, native bridging, and automated app releases.",
    totalHours: "36 hours",
    externalRoadmapUrl: "https://roadmap.sh/android",
    externalRoadmapLabel: "roadmap.sh / Android",
    secondaryRoadmapUrl: "https://roadmap.sh/ios",
    secondaryRoadmapLabel: "roadmap.sh / iOS",
    modules: [
      {
        id: "mob-mod-1",
        number: 1,
        title: "Mobile Architecture & Offline Persistence",
        skills: [
          {
            id: "mob-sk-1",
            name: "React Native / Expo Architecture & Fabric Renderer",
            desc: "Understand the New Architecture, TurboModules, JSI (JavaScript Interface), Hermes engine, and seamless bridging.",
            duration: "85 min",
            difficulty: "Intermediate",
            completed: true,
            portfolioBullet: "Migrated React Native application to Hermes engine with JSI TurboModules, reducing app cold-start boot time by 48%.",
            resources: [
              { type: "video", title: "React Native New Architecture Explained (Catalin Miron)", link: "https://www.youtube.com/watch?v=7ompy_0Fm48" },
              { type: "notes", title: "React Native Official New Architecture Guide", link: "https://reactnative.dev/docs/the-new-architecture/landing-page" },
              { type: "practice", title: "Build an Offline-First Notes App with Expo and MMKV", link: "https://docs.expo.dev/" }
            ]
          },
          {
            id: "mob-sk-2",
            name: "Offline-First Sync & Embedded Storage (WatermelonDB / SQLite)",
            desc: "Design local-first SQLite schema, optimistic mutation queues, background sync reconciliation, and conflict resolution.",
            duration: "95 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Architected local-first sync engine using SQLite, enabling 100% full application functionality during network dropouts.",
            resources: [
              { type: "video", title: "Offline-First Mobile Apps Architecture (William Candillon)", link: "https://www.youtube.com/watch?v=e_04ZrNroTo" },
              { type: "notes", title: "WatermelonDB: High-Performance Reactive Database for React Native", link: "https://watermelondb.dev/docs" },
              { type: "practice", title: "Implement Delta Sync with Optimistic UI Updates", link: "https://github.com/Nozbe/WatermelonDB" }
            ]
          }
        ]
      },
      {
        id: "mob-mod-2",
        number: 2,
        title: "Gesture Animations & App Store CI/CD",
        skills: [
          {
            id: "mob-sk-3",
            name: "60 FPS Gesture Animations (React Native Reanimated & Gesture Handler)",
            desc: "Run fluid UI physics entirely on the native UI thread without JavaScript bridge bottleneck lag using Reanimated 3 worklets.",
            duration: "90 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Implemented spring-physics swipe gestures using React Native Reanimated worklets, maintaining locked 60 FPS across low-end Android devices.",
            resources: [
              { type: "video", title: "React Native Reanimated 3 Course (Software Mansion)", link: "https://www.youtube.com/watch?v=yz9E1Hhm1k0" },
              { type: "notes", title: "Reanimated 3 Official Docs", link: "https://docs.swmansion.com/react-native-reanimated/" },
              { type: "practice", title: "Build an Interactive Swiper Card Interface", link: "https://github.com" }
            ]
          },
          {
            id: "mob-sk-4",
            name: "Fastlane Mobile Automation & App Store Submissions",
            desc: "Automate code signing certificates (Match), testflight beta builds, screenshot generation, and Apple/Google store deployments.",
            duration: "80 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Automated mobile release pipeline via Fastlane and GitHub Actions, reducing release deployment cycles from 4 hours to 1 click.",
            resources: [
              { type: "video", title: "Fastlane Tutorial for iOS & Android (Kavsoft)", link: "https://www.youtube.com/watch?v=F_fD1i0qN4Q" },
              { type: "notes", title: "Fastlane Official Docs & Match Setup", link: "https://docs.fastlane.tools/" },
              { type: "practice", title: "Configure Fastlane Match for Team Code Signing", link: "https://codesigning.guide/" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "eng-manager",
    roleTitle: "Engineering Manager & Tech Lead",
    category: "Leadership & Architecture",
    tagline: "Drive architectural strategy, conduct high-impact 1-on-1s, scale engineering headcount, and optimize team velocity.",
    totalHours: "30 hours",
    externalRoadmapUrl: "https://roadmap.sh/engineering-manager",
    externalRoadmapLabel: "roadmap.sh / Engineering Manager",
    modules: [
      {
        id: "em-mod-1",
        number: 1,
        title: "Engineering Team Scaling & People Leadership",
        skills: [
          {
            id: "em-sk-1",
            name: "High-Impact 1-on-1s & Career Ladder Roadmapping",
            desc: "Structure psychologically safe 1-on-1 coaching, construct skill matrix progression frameworks, and resolve interpersonal friction.",
            duration: "75 min",
            difficulty: "Beginner",
            completed: true,
            portfolioBullet: "Mentored 12 direct report engineers with personalized career progression ladders, resulting in 0% voluntary attrition over 18 months.",
            resources: [
              { type: "video", title: "How to Run Effective 1-on-1s (First Round Review)", link: "https://www.youtube.com/watch?v=eYk92u00cR0" },
              { type: "notes", title: "The Manager's Path: A Guide for Tech Leaders (Camille Fournier)", link: "https://www.oreilly.com/library/view/the-managers-path/9781491973882/" },
              { type: "practice", title: "Formulate an Engineering Competency Matrix across L3-L6 Tiers", link: "https://progression.fyi/" }
            ]
          },
          {
            id: "em-sk-2",
            name: "Hiring Pipelines, Structured Interviews & Rubrics",
            desc: "Design bias-resistant technical assessment rubrics, lead debrief consensus discussions, and close high-caliber engineering candidates.",
            duration: "70 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Overhauled technical interview loops with standardized objective rubrics, raising candidate offer acceptance rates from 68% to 88%.",
            resources: [
              { type: "video", title: "Engineering Hiring Secrets (Gergely Orosz / The Pragmatic Engineer)", link: "https://www.youtube.com/watch?v=eB1qR1JmIq4" },
              { type: "notes", title: "Work Rules! Insights from Inside Google (Laszlo Bock Notes)", link: "https://www.workrules.net/" },
              { type: "practice", title: "Design a 45-minute System Architecture Interview Rubric", link: "https://coda.io" }
            ]
          }
        ]
      },
      {
        id: "em-mod-2",
        number: 2,
        title: "Technical Strategy & Delivery Velocity",
        skills: [
          {
            id: "em-sk-3",
            name: "Managing Technical Debt vs Feature Velocity (RFC Process)",
            desc: "Institute lightweight Request for Comments (RFC) engineering proposals, prioritize tech debt paydown, and track DORA metrics.",
            duration: "85 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Instituted organizational RFC review process, balancing tech debt refactors to lower production incident severity counts by 58%.",
            resources: [
              { type: "video", title: "Measuring Developer Productivity & DORA Metrics (Google Cloud)", link: "https://www.youtube.com/watch?v=b4b2gXb0-Jk" },
              { type: "notes", title: "Accelerate: The Science of Lean Software and DevOps", link: "https://itrevolution.com/book/accelerate/" },
              { type: "practice", title: "Draft an Engineering Architecture RFC Template for Your Team", link: "https://github.com" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "digital-marketing",
    roleTitle: "Digital Marketing & Growth Manager",
    category: "Marketing & Growth",
    tagline: "Drive measurable customer acquisition, optimize multi-channel conversion funnels, master paid ads, lifecycle retention, and campaign attribution.",
    totalHours: "30 hours",
    externalRoadmapUrl: "https://roadmap.sh",
    externalRoadmapLabel: "Growth & Performance Marketing Blueprint",
    preparationPlatformUrl: "https://cxl.com",
    preparationPlatformLabel: "CXL Marketing Playbooks",
    modules: [
      {
        id: "mkt-mod-1",
        number: 1,
        title: "Growth Metrics, Attribution & Unit Economics",
        skills: [
          {
            id: "mkt-sk-1",
            name: "CAC, LTV & Payback Period Modeling",
            desc: "Calculate blended vs paid Customer Acquisition Cost, Customer Lifetime Value across cohorts, and payback period targets for sustainable scaling.",
            duration: "120 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Constructed cohort-level CAC and LTV sensitivity models, identifying high-churn customer segments to improve 60-day retention by 22%.",
            resources: [
              { type: "video", title: "SaaS Metrics 2.0 — Guide to CAC & LTV (David Skok)", link: "https://www.forentrepreneurs.com/saas-metrics-2/" },
              { type: "notes", title: "Unit Economics Explained — Andreessen Horowitz", link: "https://a16z.com" },
              { type: "practice", title: "Build a Google Sheets Paid Channel CAC/LTV Model", link: "https://docs.google.com/spreadsheets" }
            ]
          },
          {
            id: "mkt-sk-2",
            name: "Multi-Touch Attribution & Analytics Setup (GA4 & PostHog)",
            desc: "Configure first-touch, last-touch, and data-driven attribution models, set up custom conversion events in GA4, and interpret blended ROAS.",
            duration: "150 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Architected multi-touch attribution across Google and Meta campaigns, reallocating 25% of underperforming ad spend to raise ROAS from 1.8x to 3.2x.",
            resources: [
              { type: "video", title: "Google Analytics 4 Full Masterclass", link: "https://www.youtube.com/watch?v=kYI6j1Hj_7c" },
              { type: "notes", title: "Marketing Attribution Models Deep Dive", link: "https://support.google.com/analytics/answer/10596866" },
              { type: "practice", title: "Audit an E-Commerce Conversion Funnel with UTM Parameters", link: "https://ga4.google.com" }
            ]
          }
        ]
      },
      {
        id: "mkt-mod-2",
        number: 2,
        title: "Paid Acquisition & Conversion Rate Optimization (CRO)",
        skills: [
          {
            id: "mkt-sk-3",
            name: "Performance Paid Advertising (Google Search & Meta Ads)",
            desc: "Structure high-intent search campaigns, keyword match types, negative lists, target CPA bidding, and dynamic Meta creative testing matrices.",
            duration: "180 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Managed $45k/mo paid media budget across Google Search and Meta, scaling pipeline volume by 40% while lowering Cost Per Lead by 18%.",
            resources: [
              { type: "video", title: "Google Ads Tutorial for Performance Marketers", link: "https://www.youtube.com/watch?v=0Q77G41m91k" },
              { type: "notes", title: "Meta Blueprint Paid Ad Strategy", link: "https://www.facebook.com/business/learn" },
              { type: "practice", title: "Draft a 10-Variation Ad Creative Matrix with Hypotheses", link: "https://docs.google.com" }
            ]
          },
          {
            id: "mkt-sk-4",
            name: "A/B Testing & Landing Page Optimization",
            desc: "Formulate statistical hypotheses, calculate sample sizes to avoid false positives, eliminate friction above the fold, and test copy vs layout variants.",
            duration: "120 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Executed 8 landing page split tests using statistical significance thresholds, achieving a 34% uplift in primary lead form conversions.",
            resources: [
              { type: "video", title: "Conversion Rate Optimization Masterclass (CXL)", link: "https://cxl.com/blog/cro-basics/" },
              { type: "notes", title: "Sample Size and Statistical Power for A/B Tests (Evan Miller)", link: "https://www.evanmiller.org/ab-testing/sample-size.html" },
              { type: "practice", title: "Redesign a Low-Converting Hero Section with Proven Copy Frameworks", link: "https://figma.com" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "b2b-sales",
    roleTitle: "B2B Sales & Account Executive",
    category: "Sales & Commercial",
    tagline: "Master high-ticket B2B enterprise deals: ICP qualification, MEDDPICC framework, discovery diagnostics, executive pitching, and closing strategies.",
    totalHours: "28 hours",
    externalRoadmapUrl: "https://roadmap.sh",
    externalRoadmapLabel: "Enterprise Sales Career Framework",
    preparationPlatformUrl: "https://www.gong.io",
    preparationPlatformLabel: "Gong Reality Labs Playbooks",
    modules: [
      {
        id: "sales-mod-1",
        number: 1,
        title: "Deal Qualification & Strategic Discovery",
        skills: [
          {
            id: "sales-sk-1",
            name: "MEDDPICC Enterprise Deal Qualification",
            desc: "Evaluate Metrics, Economic Buyer, Decision Criteria, Decision Process, Paper Process, Identify Pain, Champion, and Competition on complex enterprise deals.",
            duration: "150 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Applied MEDDPICC qualification across a 24-account pipeline, disqualifying bad fits early to boost deal close rate from 21% to 34%.",
            resources: [
              { type: "video", title: "MEDDPICC Framework Explained for Account Executives", link: "https://www.youtube.com/watch?v=KzE_xJkQx88" },
              { type: "notes", title: "The Challenger Sale & MEDDPICC Implementation Guide", link: "https://www.gartner.com" },
              { type: "practice", title: "Score an Enterprise Prospect on all 8 MEDDPICC Dimensions", link: "https://docs.google.com" }
            ]
          },
          {
            id: "sales-sk-2",
            name: "High-Impact Discovery Calls & Pain Extraction",
            desc: "Lead diagnostic conversations using open-ended questioning, surface second-order business implications, and avoid premature pitch delivery.",
            duration: "140 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Conducted 120+ executive discovery calls, extracting quantified business pain to drive average deal size increases of 28%.",
            resources: [
              { type: "video", title: "The Anatomy of a Perfect Discovery Call (Gong Labs)", link: "https://www.gong.io/blog/discovery-call-questions/" },
              { type: "notes", title: "SPIN Selling Questioning Methodology", link: "https://www.hubspot.com/sales/spin-selling" },
              { type: "practice", title: "Roleplay a 15-Minute VP-Level Discovery Conversation", link: "https://hicejo.com/dashboard/interview" }
            ]
          }
        ]
      },
      {
        id: "sales-mod-2",
        number: 2,
        title: "Demonstrations, Objections & Contract Closing",
        skills: [
          {
            id: "sales-sk-3",
            name: "Value-Driven Demos & Custom Business Case (ROI)",
            desc: "Deliver solution demos anchored strictly in the prospect's verified pain points, calculate ROI payback models, and align with the Economic Buyer.",
            duration: "160 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Built tailor-made financial ROI calculators for executive buyers, accelerating enterprise contract approval cycles by 3 weeks.",
            resources: [
              { type: "video", title: "Demonstrating to Win: Demo Best Practices (Great Demo!)", link: "https://www.youtube.com/watch?v=3-M9B6kR0y4" },
              { type: "notes", title: "How to Build a High-Converting B2B Business Case", link: "https://hbr.org" },
              { type: "practice", title: "Create a 3-Slide Executive Solution Presentation", link: "https://docs.google.com/presentation" }
            ]
          },
          {
            id: "sales-sk-4",
            name: "Objection Handling, Pricing Defense & Procurement Negotiation",
            desc: "Defend contract value against procurement discounting, reframe budget freezes, negotiate mutual action plans (MAP), and secure legal sign-off.",
            duration: "130 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Negotiated 14 enterprise SaaS agreements with procurement teams, protecting software margins with less than 5% average concession discount.",
            resources: [
              { type: "video", title: "Never Split the Difference: Tactical Negotiation (Chris Voss)", link: "https://www.youtube.com/watch?v=guZa7mQV1l0" },
              { type: "notes", title: "Mutual Action Plan (MAP) Template and Guide", link: "https://www.gong.io" },
              { type: "practice", title: "Handle Budget Freeze Objections in Mock Sparring", link: "https://hicejo.com/dashboard/interview" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "financial-analyst",
    roleTitle: "Financial Analyst & Corporate Finance",
    category: "Finance & Strategy",
    tagline: "Build institutional-grade 3-statement financial models, master DCF valuations, conduct variance analysis, and communicate insights to leadership.",
    totalHours: "35 hours",
    externalRoadmapUrl: "https://corporatefinanceinstitute.com",
    externalRoadmapLabel: "CFI Financial Modeling Roadmap",
    preparationPlatformUrl: "https://www.wallstreetprep.com",
    preparationPlatformLabel: "Wall Street Prep Modeling Guides",
    modules: [
      {
        id: "fin-mod-1",
        number: 1,
        title: "3-Statement Financial Modeling & Accounting Mechanics",
        skills: [
          {
            id: "fin-sk-1",
            name: "Dynamic 3-Statement Integration (Income Statement, Balance Sheet, Cash Flow)",
            desc: "Link revenue schedules, debt schedules, working capital accounts, depreciation waterfalls, and cash sweeps across all three financial statements dynamically.",
            duration: "200 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Constructed dynamic 3-statement operating models in Excel, linking working capital drivers and debt amortization schedules with zero circularity errors.",
            resources: [
              { type: "video", title: "3-Statement Modeling Masterclass (Corporate Finance Institute)", link: "https://www.youtube.com/watch?v=fKj5qY2Cg2A" },
              { type: "notes", title: "Financial Statement Analysis (Investopedia / CFI)", link: "https://corporatefinanceinstitute.com/resources/financial-modeling/3-statement-model/" },
              { type: "practice", title: "Link an Income Statement and Balance Sheet from Scratch in Excel", link: "https://docs.google.com/spreadsheets" }
            ]
          },
          {
            id: "fin-sk-2",
            name: "Working Capital Optimization & Cash Flow Forecasting",
            desc: "Analyze Days Sales Outstanding (DSO), Days Payable Outstanding (DPO), and inventory turnover to forecast 13-week operational cash runway.",
            duration: "130 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Modeled a 13-week rolling cash forecast that identified working capital bottlenecks, freeing up $1.2M in operational liquidity.",
            resources: [
              { type: "video", title: "13-Week Cash Flow Modeling Explained", link: "https://www.youtube.com/watch?v=Tf37U_Lz19s" },
              { type: "notes", title: "Working Capital Management Strategies", link: "https://corporatefinanceinstitute.com" },
              { type: "practice", title: "Calculate Cash Conversion Cycle and Build Sensitivity Table", link: "https://docs.google.com/spreadsheets" }
            ]
          }
        ]
      },
      {
        id: "fin-mod-2",
        number: 2,
        title: "Valuation, FP&A & Board Reporting",
        skills: [
          {
            id: "fin-sk-3",
            name: "Discounted Cash Flow (DCF) & Trading Comparables Valuation",
            desc: "Calculate Weighted Average Cost of Capital (WACC), project unlevered free cash flow, evaluate terminal value (Exit Multiple vs Perpetuity Growth), and run Comps.",
            duration: "180 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Built comprehensive DCF valuation models with 2-way sensitivity tables on WACC and terminal growth rates for board-level strategic reviews.",
            resources: [
              { type: "video", title: "DCF Model from Scratch (Wall Street Prep / Aswath Damodaran)", link: "https://www.youtube.com/watch?v=p7pK4h57QfE" },
              { type: "notes", title: "Damodaran Online Corporate Valuation Archive (NYU Stern)", link: "https://pages.stern.nyu.edu/~adamodar/" },
              { type: "practice", title: "Value a Public Enterprise using Trading Comps & DCF", link: "https://docs.google.com/spreadsheets" }
            ]
          },
          {
            id: "fin-sk-4",
            name: "Budgeting, Variance Analysis & FP&A Executive Dashboards",
            desc: "Analyze Budget vs Actual (BvA) variances, pinpoint volume vs price impacts, and design executive summaries for CFO/Board presentations.",
            duration: "140 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Spearheaded monthly Budget vs Actual variance reviews across 5 business units, driving 8% cost reductions in non-essential OPEX.",
            resources: [
              { type: "video", title: "Variance Analysis and Management Reporting Guide", link: "https://www.youtube.com/watch?v=3R-7V94_YhU" },
              { type: "notes", title: "FP&A Best Practices Guide", link: "https://corporatefinanceinstitute.com" },
              { type: "practice", title: "Draft a 1-Page CFO Executive Memo Explaining Q3 Margin Variance", link: "https://docs.google.com" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "operations-pm",
    roleTitle: "Operations & Project Management",
    category: "Operations & Management",
    tagline: "Drive cross-functional project delivery, eliminate operational bottlenecks, enforce agile governance, manage vendor SLAs, and align stakeholder roadmaps.",
    totalHours: "26 hours",
    externalRoadmapUrl: "https://roadmap.sh",
    externalRoadmapLabel: "Project & Operations Management Blueprint",
    preparationPlatformUrl: "https://www.atlassian.com/agile",
    preparationPlatformLabel: "Atlassian Agile & Operations Playbooks",
    modules: [
      {
        id: "ops-mod-1",
        number: 1,
        title: "Process Optimization & Operational Governance",
        skills: [
          {
            id: "ops-sk-1",
            name: "Process Mapping, Value Stream & Bottleneck Elimination",
            desc: "Map existing business processes (SIPOC, swimlane diagrams), identify hand-off waste, measure cycle times, and redesign high-throughput workflows.",
            duration: "140 min",
            difficulty: "Beginner",
            completed: false,
            portfolioBullet: "Mapped and streamlined cross-departmental client onboarding workflows, reducing customer time-to-value from 18 days down to 6 days.",
            resources: [
              { type: "video", title: "Process Mapping & Value Stream Analysis (Lean Six Sigma)", link: "https://www.youtube.com/watch?v=9g0H2bS5L0c" },
              { type: "notes", title: "SIPOC and Workflow Optimization Principles", link: "https://asq.org" },
              { type: "practice", title: "Create a Swimlane Process Diagram in Miro or Figma", link: "https://miro.com" }
            ]
          },
          {
            id: "ops-sk-2",
            name: "Vendor Management, SLAs & Procurement Governance",
            desc: "Draft statements of work (SOW), negotiate Service Level Agreements (SLAs), audit vendor delivery against milestones, and manage vendor risk.",
            duration: "130 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Managed 12 vendor relationships with enforceable SLA penalties, resolving breach disputes and saving $140K in annual outsourced spend.",
            resources: [
              { type: "video", title: "Vendor SLA Management Best Practices", link: "https://www.youtube.com/watch?v=8b5V90_m1q4" },
              { type: "notes", title: "Guide to Drafting Bulletproof SOWs & Vendor SLAs", link: "https://hbr.org" },
              { type: "practice", title: "Draft an SLA Scorecard with 4 Critical Performance Metrics", link: "https://docs.google.com" }
            ]
          }
        ]
      },
      {
        id: "ops-mod-2",
        number: 2,
        title: "Agile Project Delivery & Cross-Functional Roadmapping",
        skills: [
          {
            id: "ops-sk-3",
            name: "Agile, Scrum & Kanban Project Execution (JIRA)",
            desc: "Lead sprint planning, manage backlog grooming, calculate team velocity, track burndown charts, and resolve blocker dependencies across workstreams.",
            duration: "150 min",
            difficulty: "Intermediate",
            completed: false,
            portfolioBullet: "Governed 6 cross-functional release sprints in JIRA with zero scope creep, hitting 95% on-time milestone delivery across 3 quarters.",
            resources: [
              { type: "video", title: "Agile Project Management Masterclass (Atlassian)", link: "https://www.youtube.com/watch?v=1u4bX0jFqV4" },
              { type: "notes", title: "Scrum Guide (Official)", link: "https://scrumguides.org/" },
              { type: "practice", title: "Configure a Multi-Team JIRA Board with WIP Limits and Epics", link: "https://jira.atlassian.com" }
            ]
          },
          {
            id: "ops-sk-4",
            name: "Risk Management Matrix & Executive OKR Alignment",
            desc: "Construct RAID logs (Risks, Assumptions, Issues, Dependencies), score impact vs likelihood, and communicate operational progress up to executive stakeholders.",
            duration: "120 min",
            difficulty: "Advanced",
            completed: false,
            portfolioBullet: "Established executive RAID governance and weekly milestone reviews, neutralizing 14 high-severity delivery risks before client rollout.",
            resources: [
              { type: "video", title: "RAID Log & Project Risk Management Explained", link: "https://www.youtube.com/watch?v=Pq98rK4k61s" },
              { type: "notes", title: "Measure What Matters: The OKR Framework (John Doerr)", link: "https://www.whatmatters.com" },
              { type: "practice", title: "Build a Comprehensive Project RAID Log and Mitigation Plan", link: "https://docs.google.com/spreadsheets" }
            ]
          }
        ]
      }
    ]
  }
];

export interface RoleSuggestion {
  id: string;
  title: string;
  category: string;
  commonSkills: string[];
}

export const POPULAR_ROLES: RoleSuggestion[] = [
  { id: "fullstack", title: "Full Stack Engineer", category: "Engineering", commonSkills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "REST APIs", "Docker", "Tailwind CSS"] },
  { id: "backend", title: "Backend Engineer", category: "Engineering", commonSkills: ["Go", "Python", "Java", "Distributed Systems", "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes", "gRPC", "System Design"] },
  { id: "frontend", title: "Frontend Engineer", category: "Engineering", commonSkills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Core Web Vitals", "Zustand", "Redux", "Jest", "Playwright", "Web Accessibility (WCAG)"] },
  { id: "ai-ml", title: "AI & Machine Learning Engineer", category: "Data & AI", commonSkills: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "Large Language Models (LLMs)", "RAG Architectures", "Hugging Face", "Vector Databases", "FastAPI", "Docker"] },
  { id: "data-engineer", title: "Data Engineer", category: "Data & AI", commonSkills: ["Python", "SQL", "Apache Spark", "PySpark", "Apache Airflow", "Snowflake", "BigQuery", "dbt (Data Build Tool)", "Apache Kafka", "Data Modeling"] },
  { id: "devops", title: "DevOps & Cloud Engineer", category: "Infrastructure", commonSkills: ["Docker", "Kubernetes", "Terraform", "GitHub Actions", "AWS", "Google Cloud (GCP)", "Prometheus", "Grafana", "Linux Systems", "Helm"] },
  { id: "product-manager", title: "Product Manager", category: "Product & Design", commonSkills: ["Product Strategy", "Roadmap Prioritization", "Product Requirements Documents (PRDs)", "User Research", "A/B Testing", "Product Analytics", "SQL", "Agile & Scrum", "JIRA"] },
  { id: "ui-ux", title: "Product Designer (UI/UX)", category: "Product & Design", commonSkills: ["Figma", "UI Design", "UX Design", "Design Systems", "User Research", "Usability Testing", "Wireframing", "Interactive Prototyping", "Design Tokens", "Web Accessibility (WCAG)"] },
  { id: "mobile-engineer", title: "Mobile Engineer", category: "Engineering", commonSkills: ["React Native", "TypeScript", "Swift", "Kotlin", "Flutter", "iOS Development", "Android Development", "Mobile State Management", "Offline-First Sync", "REST APIs"] },
  { id: "eng-manager", title: "Engineering Manager / Tech Lead", category: "Leadership", commonSkills: ["Technical RFC Review", "System Architecture Governance", "Sprint Planning & Capacity", "DORA Delivery Metrics", "1-on-1s & Mentorship", "Cross-Functional Alignment", "Incident Post-Mortems", "Hiring & Team Culture"] },
  { id: "digital-marketing", title: "Digital Marketing & Growth Manager", category: "Marketing & Growth", commonSkills: ["Google Ads", "Meta Ads", "Google Analytics 4", "SEO/SEM", "CAC & LTV Modeling", "A/B Testing", "Attribution", "HubSpot"] },
  { id: "b2b-sales", title: "B2B Sales & Account Executive", category: "Sales & Commercial", commonSkills: ["Enterprise Discovery", "MEDDPICC", "Salesforce", "Pipeline Forecasting", "Objection Handling", "Contract Negotiation", "Solution Selling"] },
  { id: "financial-analyst", title: "Financial Analyst (Corporate & FP&A)", category: "Finance & Strategy", commonSkills: ["3-Statement Financial Modeling", "DCF Valuation", "Advanced Excel", "Budget vs Actual Variance", "Cash Flow Forecasting", "Power BI", "SQL"] },
  { id: "operations-pm", title: "Operations & Project Manager", category: "Operations & Management", commonSkills: ["Process Mapping", "Agile & Scrum", "JIRA", "RAID Risk Logs", "Vendor SLAs", "Capacity Planning", "OKR Alignment"] }
];

export interface CuratedResumeSkill {
  name: string;
  category: string;
}

export const ROLE_RESUME_SKILLS: Record<string, CuratedResumeSkill[]> = {
  "ai-ml": [
    { name: "Python", category: "Languages" },
    { name: "PyTorch", category: "Machine Learning & AI" },
    { name: "TensorFlow", category: "Machine Learning & AI" },
    { name: "Scikit-Learn", category: "Machine Learning & AI" },
    { name: "Pandas", category: "Data & Modeling" },
    { name: "NumPy", category: "Data & Modeling" },
    { name: "Large Language Models (LLMs)", category: "Generative AI" },
    { name: "RAG Architectures", category: "Generative AI" },
    { name: "Hugging Face", category: "Generative AI" },
    { name: "Vector Databases", category: "Generative AI" },
    { name: "LangChain", category: "Generative AI" },
    { name: "FastAPI", category: "Deployment & APIs" },
    { name: "Docker", category: "Deployment & APIs" },
    { name: "SQL", category: "Languages" },
    { name: "MLflow", category: "MLOps & Tools" },
    { name: "Git", category: "Tools" }
  ],
  "fullstack": [
    { name: "TypeScript", category: "Languages" },
    { name: "JavaScript", category: "Languages" },
    { name: "React", category: "Frontend Frameworks" },
    { name: "Next.js", category: "Frontend Frameworks" },
    { name: "Node.js", category: "Backend & APIs" },
    { name: "Tailwind CSS", category: "Frontend Frameworks" },
    { name: "PostgreSQL", category: "Databases" },
    { name: "REST APIs", category: "Backend & APIs" },
    { name: "GraphQL", category: "Backend & APIs" },
    { name: "Docker", category: "DevOps & Cloud" },
    { name: "Redis", category: "Databases" },
    { name: "Git", category: "Tools" },
    { name: "Jest", category: "Testing" }
  ],
  "frontend": [
    { name: "TypeScript", category: "Languages" },
    { name: "JavaScript", category: "Languages" },
    { name: "React", category: "Frameworks" },
    { name: "Next.js", category: "Frameworks" },
    { name: "HTML5 & CSS3", category: "Core Web" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Zustand", category: "State Management" },
    { name: "Redux", category: "State Management" },
    { name: "Core Web Vitals", category: "Web Performance" },
    { name: "Web Accessibility (WCAG)", category: "Web Standards" },
    { name: "Playwright", category: "Testing" },
    { name: "Git", category: "Tools" }
  ],
  "backend": [
    { name: "Go", category: "Languages" },
    { name: "Python", category: "Languages" },
    { name: "Java", category: "Languages" },
    { name: "Node.js", category: "Languages" },
    { name: "PostgreSQL", category: "Databases" },
    { name: "Redis", category: "Databases" },
    { name: "Apache Kafka", category: "Distributed Systems" },
    { name: "Microservices", category: "Architecture" },
    { name: "System Design", category: "Architecture" },
    { name: "REST APIs", category: "APIs & Protocols" },
    { name: "gRPC", category: "APIs & Protocols" },
    { name: "Docker", category: "DevOps & Cloud" },
    { name: "Kubernetes", category: "DevOps & Cloud" },
    { name: "Git", category: "Tools" }
  ],
  "data-engineer": [
    { name: "Python", category: "Languages" },
    { name: "SQL", category: "Languages" },
    { name: "Apache Spark", category: "Big Data & Processing" },
    { name: "PySpark", category: "Big Data & Processing" },
    { name: "Apache Airflow", category: "Orchestration" },
    { name: "dbt (Data Build Tool)", category: "Transformation" },
    { name: "Snowflake", category: "Data Warehouses" },
    { name: "BigQuery", category: "Data Warehouses" },
    { name: "Apache Kafka", category: "Streaming" },
    { name: "Data Modeling", category: "Architecture" },
    { name: "Docker", category: "Tools" },
    { name: "Git", category: "Tools" }
  ],
  "devops": [
    { name: "Docker", category: "Containers" },
    { name: "Kubernetes", category: "Orchestration" },
    { name: "Terraform", category: "Infrastructure as Code" },
    { name: "AWS", category: "Cloud Platforms" },
    { name: "Google Cloud (GCP)", category: "Cloud Platforms" },
    { name: "Linux", category: "Operating Systems" },
    { name: "GitHub Actions", category: "CI/CD" },
    { name: "Prometheus", category: "Observability" },
    { name: "Grafana", category: "Observability" },
    { name: "Helm", category: "Orchestration" },
    { name: "Bash", category: "Scripting" },
    { name: "Python", category: "Scripting" },
    { name: "Git", category: "Tools" }
  ],
  "product-manager": [
    { name: "Product Strategy", category: "Strategy & Vision" },
    { name: "Roadmap Prioritization", category: "Strategy & Vision" },
    { name: "Product Requirements Documents (PRDs)", category: "Execution" },
    { name: "User Research", category: "Customer Discovery" },
    { name: "A/B Testing", category: "Analytics & Experimentation" },
    { name: "Product Analytics", category: "Analytics & Experimentation" },
    { name: "SQL", category: "Analytics & Experimentation" },
    { name: "Agile & Scrum", category: "Process" },
    { name: "JIRA", category: "Process" },
    { name: "Wireframing", category: "Design" },
    { name: "Go-To-Market Planning", category: "Strategy & Vision" }
  ],
  "ui-ux": [
    { name: "Figma", category: "Design Tools" },
    { name: "UI Design", category: "Design" },
    { name: "UX Design", category: "Design" },
    { name: "Design Systems", category: "Architecture" },
    { name: "Interactive Prototyping", category: "Prototyping" },
    { name: "Wireframing", category: "Design" },
    { name: "User Research", category: "Research & Testing" },
    { name: "Usability Testing", category: "Research & Testing" },
    { name: "Information Architecture", category: "Architecture" },
    { name: "Design Tokens", category: "Architecture" },
    { name: "Web Accessibility (WCAG)", category: "Standards" }
  ],
  "mobile-engineer": [
    { name: "React Native", category: "Mobile Frameworks" },
    { name: "TypeScript", category: "Languages" },
    { name: "Swift", category: "Languages" },
    { name: "iOS Development", category: "Platforms" },
    { name: "Android Development", category: "Platforms" },
    { name: "Kotlin", category: "Languages" },
    { name: "Flutter", category: "Mobile Frameworks" },
    { name: "Mobile State Management", category: "Architecture" },
    { name: "Offline-First Data Sync", category: "Architecture" },
    { name: "REST APIs", category: "APIs & Networking" },
    { name: "App Store Connect", category: "CI/CD & Deployment" },
    { name: "Git", category: "Tools" }
  ],
  "cybersecurity": [
    { name: "Network Security", category: "Security" },
    { name: "Vulnerability Assessment", category: "Security" },
    { name: "Penetration Testing", category: "Security" },
    { name: "SIEM & Splunk", category: "Monitoring & Tools" },
    { name: "Wireshark", category: "Monitoring & Tools" },
    { name: "OWASP Top 10", category: "Standards" },
    { name: "Linux", category: "Systems" },
    { name: "Python", category: "Languages" },
    { name: "Bash", category: "Scripting" },
    { name: "Incident Response", category: "Security" }
  ],
  "data-analyst": [
    { name: "SQL", category: "Languages" },
    { name: "Python", category: "Languages" },
    { name: "Tableau", category: "Data Visualization" },
    { name: "Power BI", category: "Data Visualization" },
    { name: "Excel (Advanced)", category: "Analysis Tools" },
    { name: "Pandas", category: "Data Analysis" },
    { name: "Exploratory Data Analysis", category: "Methodologies" },
    { name: "Statistical Modeling", category: "Methodologies" },
    { name: "A/B Testing", category: "Methodologies" },
    { name: "Metabase", category: "Data Visualization" }
  ],
  "eng-manager": [
    { name: "Technical RFC Review", category: "Technical Leadership" },
    { name: "System Architecture Governance", category: "Technical Leadership" },
    { name: "Sprint Planning & Capacity", category: "Delivery Management" },
    { name: "DORA Delivery Metrics", category: "Delivery Management" },
    { name: "1-on-1s & Mentorship", category: "People Management" },
    { name: "Cross-Functional Alignment", category: "Leadership" },
    { name: "Incident Post-Mortems", category: "Process" },
    { name: "Hiring & Team Culture", category: "People Management" }
  ],
  "digital-marketing": [
    { name: "Google Ads (PPC)", category: "Paid Media" },
    { name: "Meta Ads Manager", category: "Paid Media" },
    { name: "Google Analytics 4 (GA4)", category: "Analytics" },
    { name: "SEO & SEM Strategy", category: "Organic Growth" },
    { name: "A/B Testing & CRO", category: "Growth & Optimization" },
    { name: "CAC / LTV Unit Economics", category: "Metrics & Strategy" },
    { name: "Multi-Touch Attribution", category: "Analytics" },
    { name: "HubSpot & Email Automation", category: "Lifecycle Marketing" },
    { name: "PostHog & Mixpanel", category: "Analytics" }
  ],
  "b2b-sales": [
    { name: "Enterprise Discovery", category: "Sales Methodology" },
    { name: "MEDDPICC Qualification", category: "Sales Methodology" },
    { name: "Salesforce CRM", category: "Tools" },
    { name: "Pipeline & Forecast Management", category: "Execution" },
    { name: "Objection Handling", category: "Negotiation" },
    { name: "Executive Solution Selling", category: "Strategy" },
    { name: "Mutual Action Plans (MAP)", category: "Execution" },
    { name: "Contract Negotiation", category: "Commercial" },
    { name: "HubSpot CRM", category: "Tools" }
  ],
  "financial-analyst": [
    { name: "3-Statement Financial Modeling", category: "Financial Modeling" },
    { name: "DCF Valuation", category: "Valuation" },
    { name: "Excel (Advanced / Financial Functions)", category: "Tools" },
    { name: "Budget vs Actual (BvA) Variance", category: "FP&A" },
    { name: "Working Capital Optimization", category: "Corporate Finance" },
    { name: "Cash Flow Forecasting", category: "FP&A" },
    { name: "Trading & Transaction Comps", category: "Valuation" },
    { name: "Power BI & Tableau", category: "Data Visualization" },
    { name: "SQL", category: "Data & Querying" }
  ],
  "operations-pm": [
    { name: "Process Mapping & Streamlining", category: "Process Optimization" },
    { name: "Agile & Scrum (Scrum Master)", category: "Methodologies" },
    { name: "JIRA & Confluence", category: "Project Tools" },
    { name: "RAID Risk Management", category: "Governance" },
    { name: "Vendor SLA Management", category: "Commercial" },
    { name: "Capacity & Resource Planning", category: "Operations" },
    { name: "Cross-Functional Leadership", category: "Leadership" },
    { name: "OKR Alignment & Tracking", category: "Strategy" },
    { name: "Asana & Monday.com", category: "Project Tools" }
  ]
};

export function getCuratedSkillsForRole(roleTitle: string): CuratedResumeSkill[] {
  const normalized = (roleTitle || "").toLowerCase().trim();

  // Non-tech roles: Digital Marketing, Sales, Finance, Operations
  if (normalized.includes("market") || normalized.includes("growth") || normalized.includes("seo") || normalized.includes("sem") || normalized.includes("content")) {
    return ROLE_RESUME_SKILLS["digital-marketing"];
  }

  if (normalized.includes("sales") || normalized.includes("account exec") || normalized.includes("sdr") || normalized.includes("bdr") || normalized.includes("commercial")) {
    return ROLE_RESUME_SKILLS["b2b-sales"];
  }

  if (normalized.includes("financ") || normalized.includes("fp&a") || normalized.includes("accounting") || normalized.includes("valuation") || normalized.includes("banking")) {
    return ROLE_RESUME_SKILLS["financial-analyst"];
  }

  if (normalized.includes("operat") || normalized.includes("project man") || normalized.includes("program man") || normalized.includes("scrum") || normalized.includes("agile")) {
    return ROLE_RESUME_SKILLS["operations-pm"];
  }

  // 1. AI & Machine Learning Engineer / Data Scientist / ML Engineer
  if (
    normalized.includes("ai") ||
    normalized.includes("machine learning") ||
    normalized.includes("ml") ||
    normalized.includes("deep learning") ||
    normalized.includes("data scien") ||
    normalized.includes("nlp") ||
    normalized.includes("computer vision") ||
    normalized.includes("artificial intelligence")
  ) {
    return ROLE_RESUME_SKILLS["ai-ml"];
  }

  // 2. Data Engineer
  if (normalized.includes("data eng") || normalized.includes("analytics eng") || normalized.includes("etl")) {
    return ROLE_RESUME_SKILLS["data-engineer"];
  }

  // 3. Data Analyst / BI
  if (normalized.includes("analyst") || normalized.includes("bi ") || normalized.includes("business intelligence")) {
    return ROLE_RESUME_SKILLS["data-analyst"];
  }

  // 4. Product Manager
  if (normalized.includes("product manager") || normalized.includes("pm") || normalized.includes("product owner") || normalized.includes("tpm")) {
    return ROLE_RESUME_SKILLS["product-manager"];
  }

  // 5. Product Designer / UI/UX
  if (normalized.includes("design") || normalized.includes("ui") || normalized.includes("ux")) {
    return ROLE_RESUME_SKILLS["ui-ux"];
  }

  // 6. DevOps & Cloud
  if (normalized.includes("devops") || normalized.includes("cloud") || normalized.includes("sre") || normalized.includes("platform") || normalized.includes("infrastructure")) {
    return ROLE_RESUME_SKILLS["devops"];
  }

  // 7. Backend Engineer
  if (normalized.includes("backend") || normalized.includes("back end") || normalized.includes("systems engineer") || normalized.includes("distributed")) {
    return ROLE_RESUME_SKILLS["backend"];
  }

  // 8. Mobile Engineer
  if (normalized.includes("mobile") || normalized.includes("ios") || normalized.includes("android") || normalized.includes("flutter") || normalized.includes("react native") || normalized.includes("swift")) {
    return ROLE_RESUME_SKILLS["mobile-engineer"];
  }

  // 9. Cybersecurity
  if (normalized.includes("sec") || normalized.includes("cyber") || normalized.includes("infosec")) {
    return ROLE_RESUME_SKILLS["cybersecurity"];
  }

  // 10. Engineering Leadership
  if (normalized.includes("lead") || normalized.includes("manager") || normalized.includes("director") || normalized.includes("vp")) {
    return ROLE_RESUME_SKILLS["eng-manager"];
  }

  // 11. Frontend Engineer
  if (normalized.includes("front") || normalized.includes("react") || normalized.includes("vue") || normalized.includes("angular")) {
    return ROLE_RESUME_SKILLS["frontend"];
  }

  // 12. Full Stack / Software Engineer / SDE (Default for software engineering roles)
  return ROLE_RESUME_SKILLS["fullstack"];
}

export function getCuratedCurriculumForRole(roleTitle: string, experienceLevel?: string): RoleCurriculum {
  const normalized = (roleTitle || "").toLowerCase().trim();

  // Non-tech roles: Digital Marketing, Sales, Finance, Operations
  if (normalized.includes("market") || normalized.includes("growth") || normalized.includes("seo") || normalized.includes("content")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "digital-marketing");
    if (found) return found;
  }

  if (normalized.includes("sales") || normalized.includes("account exec") || normalized.includes("sdr") || normalized.includes("bdr") || normalized.includes("commercial")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "b2b-sales");
    if (found) return found;
  }

  if (normalized.includes("financ") || normalized.includes("fp&a") || normalized.includes("accounting") || normalized.includes("valuation") || normalized.includes("banking")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "financial-analyst");
    if (found) return found;
  }

  if (normalized.includes("operat") || normalized.includes("project man") || normalized.includes("program man") || normalized.includes("scrum") || normalized.includes("agile")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "operations-pm");
    if (found) return found;
  }

  // Try direct match in pre-defined role curricula
  if (
    normalized.includes("ai") ||
    normalized.includes("machine learning") ||
    normalized.includes("ml") ||
    normalized.includes("deep learning") ||
    normalized.includes("data scien") ||
    normalized.includes("nlp") ||
    normalized.includes("artificial intelligence")
  ) {
    const found = ROLE_CURRICULA.find((r) => r.id === "ai-ml");
    if (found) return found;
  }

  if (normalized.includes("product") || normalized.includes("pm")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "product-manager");
    if (found) return found;
  }

  if (normalized.includes("data eng") || normalized.includes("analytics eng")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "data-engineer");
    if (found) return found;
  }

  if (normalized.includes("devops") || normalized.includes("cloud") || normalized.includes("sre") || normalized.includes("platform")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "devops");
    if (found) return found;
  }

  if (normalized.includes("backend") || normalized.includes("systems") || normalized.includes("distributed")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "backend-distributed");
    if (found) return found;
  }

  if (normalized.includes("mobile") || normalized.includes("ios") || normalized.includes("android") || normalized.includes("flutter")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "mobile-engineer");
    if (found) return found;
  }

  if (normalized.includes("sec") || normalized.includes("cyber")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "cybersecurity");
    if (found) return found;
  }

  if (normalized.includes("design") || normalized.includes("ui") || normalized.includes("ux")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "ui-ux");
    if (found) return found;
  }

  if (normalized.includes("lead") || normalized.includes("manager") || normalized.includes("director")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "eng-manager");
    if (found) return found;
  }

  if (normalized.includes("full") || normalized.includes("front") || normalized.includes("web") || normalized.includes("software") || normalized.includes("engineer")) {
    const found = ROLE_CURRICULA.find((r) => r.id === "fullstack");
    if (found) return found;
  }

  // Fallback to Fullstack curriculum
  return ROLE_CURRICULA.find((r) => r.id === "fullstack") || ROLE_CURRICULA[0];
}

