import { JobListing } from "@/types/jobs";

/**
 * Verified 10+ LPA Fresher / Early Career (0-2 years) Job Listings
 * Focused on: Data Science, AI Engineer, Machine Learning, Data Analyst, SDE roles
 * Packages range from 10 LPA to 45+ LPA (and USD 85k-135k for global remote)
 */
export const FRESHER_HIGH_PACKAGE_JOBS: JobListing[] = [
  // ==========================================
  // DATA SCIENCE (10 - 42 LPA)
  // ==========================================
  {
    id: "fresher-zomato-data-scientist",
    title: "Associate Data Scientist - Search & Personalization",
    company: "Zomato",
    companyLogo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://zomato.com",
    location: "Gurgaon, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1600000,
    maxSalary: 2400000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `About the Role:
Zomato is seeking an Associate Data Scientist to join our Search & Personalization AI team. In this role, you will build ML ranking models that power food recommendations, restaurant search, and dynamic delivery estimates for 80+ million monthly foodies.

Key Responsibilities:
• Formulate and execute machine learning models for ranking, multi-armed bandits, and customer churn prediction.
• Mine massive query clickstream datasets using SQL, Python (Pandas, NumPy), and PySpark to engineer novel behavioral features.
• Train and tune tree-based models (XGBoost, LightGBM, CatBoost) and neural recommendation embeddings.
• Design rigorous offline/online A/B testing frameworks and evaluate statistical significance using ROC-AUC, Precision/Recall, and business GMV metrics.
• Collaborate with backend engineers to deploy low-latency inference pipelines via Triton / FastAPI.

Qualifications:
• Bachelor's/Dual Degree in Computer Science, Data Science, Chemical/Electrical/Mechanical Engineering, or Quantitative discipline (IIT / NIT / BITS preferred).
• 0-2 years experience (fresh graduates welcome with strong ML project portfolio).
• Deep hands-on proficiency in Python, SQL, Statistics, Scikit-learn, and XGBoost.
• Solid grasp of probability, hypothesis testing, and algorithmic problem solving.`,
    requiredSkills: ["Python", "Machine Learning", "SQL", "Pandas", "Scikit-learn", "XGBoost", "Statistics", "A/B Testing", "EDA"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Associate+Data+Scientist+Zomato",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Associate+Data+Scientist+Zomato",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-swiggy-data-scientist",
    title: "Data Scientist I - Logistics & ETA Intelligence",
    company: "Swiggy",
    companyLogo: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://swiggy.com",
    location: "Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1600000,
    maxSalary: 2300000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `About Swiggy Logistics Data Science:
Swiggy's delivery fleet executes millions of deliveries daily. Our AI models predict rider transit time, kitchen prep delays, batching feasibility, and surge demand with second-level precision.

What You'll Do:
• Build predictive time-series and regression models for real-time ETA forecasting and dispatch routing.
• Extract, clean, and analyze high-velocity geospatial telemetry using PostGIS, SQL, and Python.
• Conduct exploratory data analysis (EDA) and apply SHAP/LIME for model interpretability.
• Monitor live prediction drift and implement automated re-training pipelines.
• Partner with product managers to test pricing elasticity and driver incentive mechanisms.

What We Look For:
• B.Tech / M.Tech in Quantitative or Engineering discipline (0-2 years experience).
• Strong coding skills in Python (NumPy, Pandas, SciPy, Scikit-learn).
• Expertise in regression, classification, clustering, cross-validation, and RMSE/MAE optimization.
• Solid background in probability distributions, hypothesis testing, and Bayesian reasoning.`,
    requiredSkills: ["Python", "SQL", "Machine Learning", "Regression", "Pandas", "NumPy", "Time Series", "EDA", "SHAP"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+Swiggy+Bengaluru",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+Swiggy+Bengaluru",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-flipkart-data-scientist",
    title: "Associate Data Scientist - Pricing & Catalog AI",
    company: "Flipkart",
    companyLogo: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://flipkart.com",
    location: "Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1800000,
    maxSalary: 2600000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Join Flipkart Data Science:
Flipkart powers India's largest e-commerce shopping events (Big Billion Days). We are looking for an Associate Data Scientist to architect algorithms for catalog auto-categorization, search semantic matching, and dynamic price optimization.

Responsibilities:
• Develop NLP and multimodal models to clean, deduplicate, and classify millions of seller product listings.
• Analyze consumer elasticity curves and competitor pricing trends to optimize discounts.
• Construct high-throughput feature pipelines using BigQuery, Spark, and Python.
• Validate ML performance with ROC-AUC, Precision, Recall, and business conversion rate metrics.

Candidate Requirements:
• Degree in Engineering, Mathematics, Computer Science, or equivalent (Freshers from top universities encouraged).
• Hands-on Python programming, SQL querying, and ML model development (Scikit-Learn, PyTorch, LightGBM).
• Understanding of NLP techniques, embeddings (BERT/transformers), and exploratory data analysis.`,
    requiredSkills: ["Python", "SQL", "Machine Learning", "NLP", "Scikit-learn", "LightGBM", "Statistics", "PyTorch"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Associate+Data+Scientist+Flipkart",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Associate+Data+Scientist+Flipkart",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-phonepe-data-scientist",
    title: "Data Scientist I - Fraud Risk & Payment Anomaly Detection",
    company: "PhonePe",
    companyLogo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://phonepe.com",
    location: "Bengaluru, India (Onsite)",
    workplaceType: "onsite",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1800000,
    maxSalary: 2800000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `PhonePe Risk & Fraud Intelligence:
PhonePe processes over 50% of India's UPI payments. Our Fraud Data Science team intercepts fraudulent transactions, merchant collusion, and account takeovers in under 30 milliseconds.

Key Responsibilities:
• Build anomaly detection models (Isolation Forests, Autoencoders, Graph Neural Networks) to spot fraudulent UPI rings.
• Formulate fraud prevention strategies with high precision (>98%) to avoid blocking genuine users.
• Mine graph relations across bank accounts, device fingerprints, and transaction graphs using Python and SQL.
• Run rigorous statistical tests on production payment cohorts.

Profile Requirements:
• B.Tech / Dual Degree from top-tier institutes (IITs / NITs / BITS).
• Strong foundations in Linear Algebra, Probability, Statistical Inference, and ML Algorithms.
• Proficiency in Python, SQL, Pandas, NumPy, Scikit-learn, and Git.`,
    requiredSkills: ["Python", "SQL", "Machine Learning", "Anomaly Detection", "Statistics", "Hypothesis Testing", "Graph Analytics"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+PhonePe+Bengaluru",
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+PhonePe+Bengaluru",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    isFeatured: false
  },
  {
    id: "fresher-fractal-data-scientist",
    title: "Data Scientist - Generative AI & Customer Insights",
    company: "Fractal Analytics",
    companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://fractal.ai",
    location: "Mumbai / Bengaluru / Pune, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1200000,
    maxSalary: 1800000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `About Fractal:
Fractal is a global leader in AI and advanced analytics for Fortune 500 enterprises. We are recruiting talented Data Scientists (0-2 yrs / freshers) to engineer custom AI solutions, churn predictors, and agentic LLM assistants.

Role Focus:
• Develop predictive ML pipelines (Regression, Classification, Clustering) on structured customer datasets.
• Implement GenAI/RAG prototypes using LangChain, OpenAI APIs, and vector embeddings.
• Communicate technical findings to executive stakeholders through interactive dashboards and clear data narratives.
• Write clean, modular Python code following Git, code reviews, and containerization standards.

Skills Required:
• B.Tech/B.E in Engineering or quantitative field.
• Python (Pandas, NumPy, Scikit-learn, Matplotlib/Seaborn).
• SQL query writing, window functions, and data transformations.
• Machine Learning fundamentals: Hyperparameter tuning, ROC-AUC, F1 score, Cross-validation.`,
    requiredSkills: ["Python", "SQL", "Machine Learning", "Pandas", "Scikit-learn", "LLMs", "EDA", "Data Visualization"],
    source: "indeed",
    sourceUrl: "https://www.indeed.com/viewjob?jk=fractal-data-scientist-entry",
    applyUrl: "https://fractal.ai/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    isFeatured: false
  },
  {
    id: "fresher-tiger-analytics-data-scientist",
    title: "Data Science Consultant (Fresh Graduate Program)",
    company: "Tiger Analytics",
    companyLogo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://tigeranalytics.com",
    location: "Chennai / Bengaluru / Hyderabad, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1150000,
    maxSalary: 1650000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Tiger Analytics Early Career Data Science:
Tiger Analytics is recognized as a leader in Enterprise AI. We help top global organizations solve complex business problems using advanced machine learning, causal inference, and mathematical optimization.

What You Will Deliver:
• Formulate predictive ML models for customer churn, demand planning, and lifetime value prediction.
• Clean and transform complex enterprise databases using SQL and Python.
• Validate statistical hypotheses, perform cross-validation, and explain model feature importances (SHAP).
• Present actionable insights to clients in healthcare, retail, and manufacturing sectors.

Requirements:
• Fresh graduate or up to 2 years experience with B.Tech/B.S. in Engineering or Mathematics.
• Solid proficiency in Python, SQL, and core statistical modeling.
• Familiarity with Scikit-learn, XGBoost, Pandas, and exploratory data analysis.`,
    requiredSkills: ["Python", "SQL", "Machine Learning", "Statistics", "Scikit-learn", "EDA", "Feature Engineering"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Tiger+Analytics+Data+Science+Fresher",
    applyUrl: "https://www.tigeranalytics.com/careers/",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
  },
  {
    id: "fresher-uber-data-scientist",
    title: "Data Scientist I - Marketplace Forecasting & Pricing",
    company: "Uber",
    companyLogo: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://uber.com",
    location: "Hyderabad / Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 2400000,
    maxSalary: 3600000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Uber Tech India Marketplace Data Science:
Uber’s Marketplace algorithms balance rider demand, driver supply, and pricing in real time across 10,000+ cities worldwide.

Responsibilities:
• Architect dynamic pricing and driver dispatch algorithms utilizing spatio-temporal ML models.
• Analyze large-scale trip logs using Hive, Presto/Trino, and PySpark to extract market dynamics.
• Design, launch, and interpret switchback A/B experiments to evaluate algorithmic uplift on marketplace throughput.
• Collaborate with software engineers to productionize machine learning services.

Requirements:
• B.Tech or M.Tech in CS, Chemical, Mechanical, Electrical Engineering, or related quantitative field (IITs/top institutes).
• Deep knowledge of probability theory, hypothesis testing, causal inference, and machine learning.
• Strong coding in Python (NumPy, SciPy, Scikit-learn, PyTorch/TensorFlow) and advanced SQL.`,
    requiredSkills: ["Python", "SQL", "Machine Learning", "Statistics", "A/B Testing", "Time Series", "Deep Learning"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+Uber+Hyderabad",
    applyUrl: "https://www.uber.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-microsoft-data-scientist",
    title: "Data & Applied Scientist I - Copilot & Search AI",
    company: "Microsoft",
    companyLogo: "https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://microsoft.com",
    location: "Hyderabad / Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 2600000,
    maxSalary: 4200000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Microsoft India Development Center (IDC):
Join the team building next-generation AI features for Microsoft Copilot, Bing, and Azure AI.

Key Focus:
• Develop semantic search algorithms, transformer-based document ranking, and retrieval-augmented generation (RAG) pipelines.
• Fine-tune foundation LLMs on enterprise corpora using PyTorch and Azure ML.
• Evaluate model hallucinations, accuracy, and safety with automated benchmarking harnesses.
• Partner across engineering teams to ship models running at planet scale with sub-50ms latency.

Qualifications:
• Bachelor's or Master's in Computer Science, Engineering, Mathematics or related quantitative field (0-2 years experience).
• Strong coding skills in Python and C++ or C#.
• Deep understanding of Machine Learning, Deep Learning (Transformers/BERT/LLMs), PyTorch, and SQL.`,
    requiredSkills: ["Python", "PyTorch", "Machine Learning", "Deep Learning", "LLMs", "NLP", "SQL", "C++"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+Microsoft+Hyderabad",
    applyUrl: "https://careers.microsoft.com",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-cred-data-scientist",
    title: "Data Scientist - Member Financial Intelligence",
    company: "CRED",
    companyLogo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://cred.club",
    location: "Bengaluru, India (Onsite)",
    workplaceType: "onsite",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 2000000,
    maxSalary: 3200000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `CRED Data Science:
CRED is an exclusive community of high-trust individuals. Our Data Science team creates risk models, rewards personalization algorithms, and peer benchmarking features for India's top creditworthy cohort.

What You'll Do:
• Train credit underwriting and risk prediction models using XGBoost, LightGBM, and neural architectures.
• Engineer behavioral transaction signals from millions of credit card statement logs.
• Build recommendation systems for CRED Store and CRED Pay merchants.
• Perform robust A/B testing on product rollouts and evaluate statistical significance.

What We Seek:
• B.Tech from top tier engineering institutes (IITs / BITS).
• Strong mathematical foundation in probability, statistics, and linear algebra.
• Mastery of Python, SQL, Pandas, Scikit-learn, and Git.`,
    requiredSkills: ["Python", "SQL", "Machine Learning", "XGBoost", "Credit Risk", "Pandas", "Statistics", "A/B Testing"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+CRED+Bengaluru",
    applyUrl: "https://cred.club/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString()
  },

  // ==========================================
  // AI ENGINEER & MACHINE LEARNING (14 - 38 LPA)
  // ==========================================
  {
    id: "fresher-sarvam-ai-engineer",
    title: "Junior AI Engineer - Indic LLMs & Voice Systems",
    company: "Sarvam AI",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://sarvam.ai",
    location: "Bengaluru, India (Onsite)",
    workplaceType: "onsite",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1800000,
    maxSalary: 2800000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `About Sarvam AI:
Sarvam AI is developing sovereign foundational AI models and generative voice tech tailored for Indian languages. Backed by Lightspeed and Peak XV, we are pioneering multimodal frontier AI in India.

Your Impact:
• Curate, tokenize, and pre-process massive multilingual text and speech corpora in 10+ Indian languages.
• Fine-tune transformer architectures (Llama, Mistral, Whisper) using PyTorch, DeepSpeed, and FlashAttention.
• Build evaluation benchmarks to quantify hallucination, syntax fluency, and reasoning across Hindi, Tamil, Telugu, Marathi, and English.
• Optimize model weights with quantizations (AWQ, GPTQ) and deploy inference endpoints with vLLM.

Who We Want:
• Strong engineering graduates (IITs / IIITs / NITs) passionate about deep learning and NLP.
• Proficient in Python, PyTorch, Hugging Face Transformers, and Linux.
• Deep curiosity for Generative AI, LLMs, and prompt engineering.`,
    requiredSkills: ["Python", "PyTorch", "LLMs", "Transformers", "NLP", "Hugging Face", "Deep Learning", "vLLM"],
    source: "wellfound",
    sourceUrl: "https://wellfound.com/company/sarvam-ai/jobs",
    applyUrl: "https://sarvam.ai",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-krutrim-ai-engineer",
    title: "Associate AI Engineer - Foundation Model Training",
    company: "Krutrim AI",
    companyLogo: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://krutrim.com",
    location: "Bengaluru, India (Onsite)",
    workplaceType: "onsite",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1600000,
    maxSalary: 2500000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `About Krutrim:
Krutrim is India's first AI unicorn, building complete AI stack capabilities from custom silicon data centers to foundational generative models.

Responsibilities:
• Train and fine-tune large language models utilizing distributed GPU clusters.
• Implement RAG (Retrieval-Augmented Generation) architectures using vector databases (Qdrant, Pinecone, Chroma).
• Build automated red-teaming and safety guardrails for chat inference.
• Profile GPU memory bandwidth and optimize training throughput.

Qualifications:
• B.Tech/Dual Degree in CS, Electrical, or quantitative disciplines (Freshers welcome).
• Strong hands-on coding in Python and PyTorch.
• Solid grasp of transformers, attention mechanisms, embeddings, and vector similarity search.`,
    requiredSkills: ["Python", "PyTorch", "Deep Learning", "LLMs", "RAG", "Vector Databases", "Transformers"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=AI+Engineer+Krutrim",
    applyUrl: "https://krutrim.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-nvidia-ai-engineer",
    title: "Junior AI & Deep Learning Software Engineer",
    company: "NVIDIA",
    companyLogo: "https://images.unsplash.com/photo-1617791160505-6f008e1e6703?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://nvidia.com",
    location: "Pune / Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 2200000,
    maxSalary: 3800000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `NVIDIA Deep Learning Systems:
NVIDIA is the engine of the global AI revolution. As a Junior AI Software Engineer, you will work on optimizing neural network inference and acceleration across NVIDIA GPUs and Tegra platforms.

Key Responsibilities:
• Optimize deep learning models with TensorRT, CUDA, and Triton Inference Server.
• Benchmark model inference throughput, latency, and memory footprint across modern GPU architectures.
• Work with cutting-edge vision, speech, and transformer architectures.
• Debug numerical precision trade-offs (FP32, FP16, INT8, FP8).

Requirements:
• B.Tech / M.Tech in Computer Science, Electrical Engineering, or related quantitative field.
• Strong programming in C++ and Python.
• Fundamental understanding of CUDA, parallel algorithms, and deep learning frameworks (PyTorch).`,
    requiredSkills: ["Python", "C++", "CUDA", "PyTorch", "Deep Learning", "TensorRT", "Computer Vision"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=NVIDIA+AI+Engineer+Pune",
    applyUrl: "https://www.nvidia.com/en-us/about-nvidia/careers/",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-razorpay-ai-engineer",
    title: "AI Engineer - Agentic Workflows & Risk Intelligence",
    company: "Razorpay",
    companyLogo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://razorpay.com",
    location: "Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1800000,
    maxSalary: 2800000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Razorpay Innovation Lab:
Razorpay is building agentic autonomous systems to automate merchant onboarding, dispute resolution, and payment reconciliation.

What You Will Build:
• Design multi-agent workflows using LangChain, LangGraph, and AutoGen for financial operations.
• Build synthetic data generation pipelines for training specialized risk classifiers.
• Containerize AI microservices in Docker and deploy with Kubernetes on AWS.
• Monitor LLM accuracy, latency budgets, and token expenditure.

Requirements:
• Degree in Engineering / Computer Science (0-2 years experience).
• High proficiency in Python, FastAPI, SQL, and Git.
• Practical knowledge of Prompt Engineering, Tool-calling agents, and Vector search.`,
    requiredSkills: ["Python", "LangChain", "FastAPI", "Docker", "SQL", "LLMs", "Machine Learning", "AWS"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=AI+Engineer+Razorpay",
    applyUrl: "https://razorpay.com/jobs",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
  },
  {
    id: "fresher-huggingface-ai-engineer",
    title: "Junior AI Engineer - Open Source ML Tools",
    company: "Hugging Face",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://huggingface.co",
    location: "Remote (Global)",
    workplaceType: "remote",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 90000,
    maxSalary: 130000,
    currency: "USD",
    salaryPeriod: "yearly",
    description: `About Hugging Face:
We are the open-source platform where millions of researchers and engineers build the future of AI.

What You'll Do:
• Maintain and improve core libraries (transformers, diffusers, datasets, accelerate).
• Write educational tutorials, documentation, and model cards for newly published open-weights architectures.
• Benchmark inference acceleration on CPUs and GPUs.
• Review community pull requests and engage with open source developers.

Who You Are:
• You love open-source and have public GitHub contributions in Python/ML.
• Deep understanding of modern ML architectures: Attention, Transformers, Tokenizers.
• Excellent written English communication.`,
    requiredSkills: ["Python", "PyTorch", "Transformers", "Git", "Open Source", "Hugging Face", "Deep Learning"],
    source: "remotive",
    sourceUrl: "https://huggingface.co/join-us",
    applyUrl: "https://huggingface.co/join-us",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isFeatured: true
  },

  // ==========================================
  // DATA ANALYST / BI ENGINEER (10 - 22 LPA)
  // ==========================================
  {
    id: "fresher-zepto-data-analyst",
    title: "Business Data Analyst - Dark Store Supply Chain & Delivery Velocity",
    company: "Zepto",
    companyLogo: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://zeptonow.com",
    location: "Mumbai / Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1200000,
    maxSalary: 1800000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Zepto Quick Commerce Analytics:
Zepto delivers groceries in 10 minutes. Our Data Analytics team tracks rider dispatch latency, picking times, SKU wastage, and dark store inventory replenishment across 400+ hubs.

Role & Impact:
• Write complex SQL queries across billions of order rows in Snowflake and PostgreSQL.
• Build automated Power BI and Tableau dashboards tracking store delivery times, order density, and stockouts.
• Perform exploratory data analysis in Python (Pandas) to diagnose root causes of delivery delays.
• Partner with city operations heads to forecast SKU demand and reduce fresh produce spoilage.

Requirements:
• B.Tech / B.S. / B.E. in Engineering, Mathematics, or Economics (IITs/NITs/tier-1 colleges preferred).
• Advanced SQL skills (CTE, window functions, query optimization).
• Hands-on Python (Pandas, NumPy, Matplotlib) and Power BI / Tableau dashboarding.`,
    requiredSkills: ["SQL", "Python", "Pandas", "Power BI", "Tableau", "EDA", "Statistics", "Supply Chain Analytics"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Data+Analyst+Zepto",
    applyUrl: "https://www.zeptonow.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-blinkit-data-analyst",
    title: "Data Analyst - Consumer Demand & Real-Time Inventory",
    company: "Blinkit",
    companyLogo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://blinkit.com",
    location: "Gurgaon, India (Onsite)",
    workplaceType: "onsite",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1200000,
    maxSalary: 1750000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Blinkit (Zomato Group) Operations Analytics:
We are expanding ultra-fast commerce to electronics, fashion, and beauty. You will uncover inventory turnover insights and optimize warehouse throughput.

Responsibilities:
• Develop real-time inventory monitoring reports and predictive stockout alerts.
• Extract consumer demand signals across search queries and cart abandonment trends.
• Conduct cohort retention analyses and A/B test promotions.
• Translate operational bottlenecks into clean visual executive summaries.

Qualifications:
• Bachelor's degree in Engineering, Math, or Business.
• Advanced SQL querying, data cleaning in Python, and strong business problem-solving mindset.`,
    requiredSkills: ["SQL", "Python", "Pandas", "Tableau", "EDA", "Cohort Analysis", "Statistics"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Data+Analyst+Blinkit+Gurgaon",
    applyUrl: "https://blinkit.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
  },
  {
    id: "fresher-groww-data-analyst",
    title: "Product Data Analyst - Investment & Trading Products",
    company: "Groww",
    companyLogo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://groww.in",
    location: "Bengaluru, India (Onsite)",
    workplaceType: "onsite",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1400000,
    maxSalary: 2100000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Groww Product Intelligence:
Groww is India's leading investment platform with over 10 million active demat users.

Role Highlights:
• Analyze user funnels from onboarding KYC to first stock/mutual fund transaction.
• Define and monitor key product metrics (DAU, WAU, trade frequency, churn).
• Run A/B experimentation and compute statistical significance for new UI feature releases.
• Model user retention cohorts in SQL and Python.

Candidate Profile:
• B.Tech/B.E from premier institutions (Freshers welcome).
• Expert in SQL, Python for data manipulation, and visualization tools (Metabase, Tableau).
• Deep curiosity about fintech, financial markets, and consumer product growth.`,
    requiredSkills: ["SQL", "Python", "Product Analytics", "A/B Testing", "Cohort Analysis", "Metabase", "Tableau"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Product+Data+Analyst+Groww",
    applyUrl: "https://groww.in/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-mckinsey-data-analyst",
    title: "Junior Analytics Specialist (Client Capabilities Network)",
    company: "McKinsey & Company",
    companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://mckinsey.com",
    location: "Gurgaon / Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1300000,
    maxSalary: 2000000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `McKinsey Client Capabilities Network (CCN):
Join McKinsey’s global data and advanced analytics hub. You will partner with international consulting teams to build statistical models, customer segmentations, and cost optimization benchmarks for Fortune 100 clients.

Key Responsibilities:
• Build statistical models, regression analyses, and customer cluster models in Python and R.
• Clean, validate, and join messy multi-source client datasets using SQL and Alteryx.
• Synthesize data findings into clear executive slide decks and interactive Tableau dashboards.
• Participate in problem-solving discussions with global client engagement managers.

Qualifications:
• B.Tech / Dual Degree / Master's with quantitative emphasis (0-2 years experience).
• High analytical acumen, structured problem solving, and proficiency in Python and SQL.
• Outstanding verbal and written business presentation skills.`,
    requiredSkills: ["Python", "SQL", "Statistics", "Regression", "Clustering", "Tableau", "EDA", "Problem Solving"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=McKinsey+Analytics+Specialist+Gurgaon",
    applyUrl: "https://www.mckinsey.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
  },
  {
    id: "fresher-dream11-data-analyst",
    title: "Data Analyst - Gaming Analytics & User Engagement",
    company: "Dream11",
    companyLogo: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://dream11.com",
    location: "Mumbai, India (Onsite)",
    workplaceType: "onsite",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1500000,
    maxSalary: 2200000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Dream11 High-Concurrency Gaming Analytics:
Dream11 handles 15+ crore sports fans during IPL. Our Analytics team decodes contest engagement, referral virality, and matchday user retention.

Responsibilities:
• Query high-volume transaction databases in Redshift and Presto.
• Design statistical models to evaluate promotion ROI and contest fill rates.
• Build automated operational dashboards and KPI anomaly monitors.
• Partner with product squads on hypothesis generation and rapid prototyping.

Profile:
• Degree in Engineering / Mathematics / Statistics (0-2 years experience).
• Strong analytical mindset with mastery over SQL and Python.`,
    requiredSkills: ["SQL", "Python", "Statistics", "A/B Testing", "EDA", "Pandas", "Metabase"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Data+Analyst+Dream11+Mumbai",
    applyUrl: "https://www.dreamsports.group/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString()
  },

  // ==========================================
  // SDE-1 / SOFTWARE ENGINEER (14 - 45 LPA)
  // ==========================================
  {
    id: "fresher-google-sde",
    title: "Software Engineer (University Graduate / Early Career)",
    company: "Google",
    companyLogo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://google.com",
    location: "Bengaluru / Hyderabad, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 2800000,
    maxSalary: 4500000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Google Campus & Early Career Engineering:
Google software engineers develop next-generation technologies that change how billions of users connect, explore, and interact with information and one another.

Responsibilities:
• Design, implement, test, and maintain high-throughput backend services in C++, Java, Go, or Python.
• Solve complex computer science problems spanning distributed storage, concurrency, and real-time computation.
• Participate in architectural design reviews, unit testing, and deployment automation.
• Work on planetary-scale infrastructure including Search, Maps, Cloud, Android, and YouTube.

Minimum Qualifications:
• Bachelor's or Master's degree in Computer Science, Chemical, Electrical, Mechanical Engineering, or related technical field.
• Experience in software development in one or more languages: C, C++, Java, Python, or Go.
• Deep understanding of data structures, algorithms, space-time complexity analysis, and object-oriented design.`,
    requiredSkills: ["C++", "Python", "Java", "Data Structures", "Algorithms", "System Design", "Distributed Systems"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+Google+India",
    applyUrl: "https://careers.google.com",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-amazon-sde",
    title: "Software Development Engineer I (SDE-1)",
    company: "Amazon",
    companyLogo: "https://images.unsplash.com/photo-1523474253246-64e118fddf18?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://amazon.com",
    location: "Hyderabad / Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 2600000,
    maxSalary: 4400000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Amazon SDE-1 Early Career:
As an SDE-1 at Amazon, you will build distributed customer-facing applications and scalable microservices backing Amazon Retail, AWS, Prime Video, or Fulfillment Technologies.

Key Responsibilities:
• Build resilient, low-latency microservices in Java, C++, or Python utilizing AWS cloud services.
• Write clean, testable code with automated unit and integration tests (JUnit, Mockito).
• Own the complete lifecycle: design, development, deployment via CI/CD pipelines, and operational telemetry.
• Collaborate with senior engineers on system design and API contracts.

Basic Qualifications:
• Bachelor's or Master's in Computer Science, Engineering, or related quantitative field (0-2 years experience).
• Solid foundations in Data Structures, Algorithms, Object-Oriented Design, and Multi-threading.
• Proficiency in Java, C++, or Python.`,
    requiredSkills: ["Java", "C++", "Python", "Data Structures", "Algorithms", "Object-Oriented Design", "AWS", "CI/CD"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Amazon+SDE+1+Hyderabad",
    applyUrl: "https://amazon.jobs",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-atlassian-sde",
    title: "Associate Software Engineer (Graduate Program)",
    company: "Atlassian",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://atlassian.com",
    location: "Bengaluru, India / Remote (Work From Anywhere)",
    workplaceType: "remote",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 2200000,
    maxSalary: 3400000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Atlassian Work From Anywhere Graduate Program:
Atlassian builds products like Jira, Confluence, and Trello that power teamwork for over 300,000 global companies.

What You'll Do:
• Build features across frontend (React, TypeScript) and backend microservices (Java, Kotlin, Spring Boot, AWS).
• Deploy daily to production using automated canary testing and feature flags.
• Improve system performance, reliability, and automated test coverage.
• Enjoy total flexibility with Atlassian's remote-first work environment.

Requirements:
• Graduating in 2024, 2025 or 2026 with a Degree in Engineering or Computer Science.
• Strong foundation in algorithms, web architectures, and object-oriented programming.
• Good familiarity with JavaScript/TypeScript, Java, or Python.`,
    requiredSkills: ["Java", "React", "TypeScript", "Python", "Microservices", "AWS", "Git"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Atlassian+Graduate+Software+Engineer",
    applyUrl: "https://www.atlassian.com/company/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-browserstack-sde",
    title: "Software Engineer - Core Cloud Infrastructure",
    company: "BrowserStack",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://browserstack.com",
    location: "Mumbai / Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1800000,
    maxSalary: 2800000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `BrowserStack Systems Engineering:
BrowserStack is the world's leading software testing platform, powering 50,000+ customers including Google, Amazon, and Microsoft.

Responsibilities:
• Architect real-time browser/device virtualization infrastructure handling billions of automated tests.
• Write high-performance concurrent code in Python, Go, Ruby, or Node.js.
• Optimize Linux kernel parameters, web socket streaming, and hardware emulation.
• Build automated telemetry to monitor network latency across worldwide data centers.

Qualifications:
• B.Tech/Dual Degree in CS, Electrical, or related discipline (IITs / NITs).
• Solid understanding of operating systems, networking, multithreading, and data structures.`,
    requiredSkills: ["Python", "Go", "Node.js", "Linux", "Data Structures", "Docker", "Networking"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+BrowserStack",
    applyUrl: "https://www.browserstack.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString()
  },
  {
    id: "fresher-goldman-sachs-analyst",
    title: "Analyst - Engineering Division (Early Career)",
    company: "Goldman Sachs",
    companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://goldmansachs.com",
    location: "Bengaluru / Hyderabad, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 2200000,
    maxSalary: 3500000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Goldman Sachs Engineering:
Engineers at Goldman Sachs build secure, high-throughput financial architectures, trade execution engines, and risk calculation systems.

Role:
• Develop algorithmic trading services, risk analytics, and client-facing platforms in Java, C++, or Python.
• Optimize relational and distributed databases for high-speed transactions.
• Apply rigorous unit testing and automated security audits before deployment.

Profile:
• Degree in Engineering, Mathematics, or Computer Science (0-2 years experience).
• Exceptional problem solving, data structures, algorithms, and clean code principles.`,
    requiredSkills: ["Java", "C++", "Python", "SQL", "Data Structures", "Algorithms", "Financial Systems"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Goldman+Sachs+Engineering+Analyst+Bengaluru",
    applyUrl: "https://www.goldmansachs.com/careers/",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-salesforce-amts",
    title: "Associate Member of Technical Staff (AMTS)",
    company: "Salesforce",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://salesforce.com",
    location: "Hyderabad / Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 2000000,
    maxSalary: 3200000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Salesforce AMTS Early Career Program:
Salesforce is the #1 CRM globally. As an AMTS, you will work on enterprise cloud architecture, Einstein AI, and multi-tenant platforms.

What You'll Do:
• Design and code scalable cloud microservices using Java, Python, and modern web frameworks.
• Develop high-performance REST and GraphQL APIs.
• Ensure enterprise security, automated unit test coverage, and continuous deployment.

Basic Qualifications:
• B.Tech or M.Tech in Computer Science or related quantitative field (0-2 years experience).
• Solid understanding of Object-Oriented Programming, Data Structures, and Algorithms.`,
    requiredSkills: ["Java", "Python", "REST APIs", "Data Structures", "Algorithms", "Cloud Computing"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Salesforce+AMTS+Hyderabad",
    applyUrl: "https://salesforce.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString()
  },
  {
    id: "fresher-deshaw-sde",
    title: "Software Development Associate - Quantitative Tech",
    company: "D. E. Shaw India",
    companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://deshawindia.com",
    location: "Hyderabad, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 3200000,
    maxSalary: 5200000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `D. E. Shaw India Tech:
D. E. Shaw is a global investment and technology development firm. Our Hyderabad engineering group builds ultra-high-performance quantitative trading infrastructure, distributed caches, and analytical modeling platforms.

What You'll Do:
• Develop high-performance backend systems in Python, C++, and Java.
• Build real-time streaming engines handling millions of market events per second.
• Optimize memory layouts, cache locality, and asynchronous I/O loops.

Candidate Profile:
• Outstanding academic credentials in Computer Science or Engineering from premier institutions (IITs/BITS).
• Superb coding and analytical problem-solving abilities.
• Deep understanding of algorithms, operating systems, and multithreading.`,
    requiredSkills: ["Python", "C++", "Data Structures", "Algorithms", "Concurrency", "Linux", "Distributed Systems"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=DE+Shaw+Software+Development+Associate",
    applyUrl: "https://www.deshawindia.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-tower-research-sde",
    title: "Junior Systems Software Engineer - Low Latency",
    company: "Tower Research Capital",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://tower-research.com",
    location: "Gurugram, India (Onsite)",
    workplaceType: "onsite",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 3500000,
    maxSalary: 6000000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Tower Research Capital High Frequency Trading Tech:
Tower Research Capital is a leading algorithmic trading firm. Our Core Engineering group builds the fastest trading platforms in the world.

Key Responsibilities:
• Write ultra-low latency modern C++ code for trade execution and order book simulation.
• Optimize Linux kernel parameters, bypass kernel network stacks (DPDK/Solarflare), and tune CPU cache usage.
• Work alongside quantitative researchers to productionize systematic trading strategies.

Who Should Apply:
• Exceptional graduates in Computer Science, Chemical, Electrical Engineering from top IITs.
• Mastery of modern C++, algorithms, data structures, and computer architecture.`,
    requiredSkills: ["C++", "Linux", "Low Latency", "Algorithms", "Data Structures", "Multithreading"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Tower+Research+Capital+Software+Engineer",
    applyUrl: "https://www.tower-research.com/careers",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
    isFeatured: true
  },
  {
    id: "fresher-cisco-sde",
    title: "Software Engineer I - Cloud & Networking Systems",
    company: "Cisco",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://cisco.com",
    location: "Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 1500000,
    maxSalary: 2400000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Cisco India Early Career Engineering:
Join Cisco's core engineering teams building cloud-scale networking, enterprise cybersecurity, and observability platforms.

Responsibilities:
• Develop networking protocols, microservices, and management APIs in Python, C++, or Go.
• Automate test suites and integrate with continuous delivery pipelines.
• Collaborate with global teams on enterprise cloud routing and container orchestration.

Qualifications:
• Bachelor's degree in Computer Science, Engineering, or quantitative discipline.
• Good foundation in networking fundamentals (TCP/IP, HTTP, routing) and data structures.`,
    requiredSkills: ["Python", "C++", "Networking", "Linux", "REST APIs", "Git", "Data Structures"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Cisco+Software+Engineer+Bengaluru",
    applyUrl: "https://www.cisco.com/c/en/us/about/careers.html",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString()
  },
  {
    id: "fresher-intuit-sde",
    title: "Software Engineer 1 - TurboTax & GenAI Architecture",
    company: "Intuit",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
    companyWebsite: "https://intuit.com",
    location: "Bengaluru, India (Hybrid)",
    workplaceType: "hybrid",
    jobType: "full-time",
    experienceLevel: "entry",
    minSalary: 2000000,
    maxSalary: 3200000,
    currency: "INR",
    salaryPeriod: "yearly",
    description: `Intuit India Development Center:
Intuit powers prosperity worldwide with QuickBooks, TurboTax, Credit Karma, and Mailchimp.

Responsibilities:
• Build resilient web and mobile features using React, TypeScript, and Java Spring Boot.
• Integrate generative AI agents to automate tax calculations and financial bookkeeping.
• Maintain high availability, zero-downtime releases, and comprehensive unit/integration test suites on AWS.

Requirements:
• Bachelor's or Master's in CS or Engineering (0-2 years experience).
• Strong coding skills in Java, Python, or JavaScript/TypeScript with knowledge of algorithms and data structures.`,
    requiredSkills: ["Java", "React", "TypeScript", "Python", "AWS", "Spring Boot", "Data Structures"],
    source: "linkedin",
    sourceUrl: "https://www.linkedin.com/jobs/search/?keywords=Intuit+Software+Engineer+1+Bengaluru",
    applyUrl: "https://www.intuit.com/careers/",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
    isFeatured: true
  }
];
