export const mockAgentResponse = {
  global_claim_summary: [
    {
      paper_id: "paper_2c4bd07be547ebcf",
      claim_text:
        "Natural language processing has been transformed by large language models, enabling tasks such as summarization and domain-specific question answering. Accurate and contextually faithful responses are critical when applying large language models to sensitive and domain-specific tasks such as answering queries related to Quranic studies. General-purpose large language models often struggle with hallucinations, where generated responses deviate from authoritative sources. The proposed framework shows that context relevance differs across models, as evidenced by comparisons of retrieval relevance. Large language models outperform medium models in answer faithfulness. Using descriptive datasets such as Quranic surahs enhances large language model performance in domain-specific tasks. The study establishes a foundation for future AI-driven informational tools and provides a framework for integrating large language models with descriptive datasets.",
      confidence_score: 0.925,
    },
  ],
  method_comparison_analysis: [
    {
      paper_id: "paper_2c4bd07be547ebcf",
      model_class: "Large Language Models (LLMs)",
      dataset_scale: "small",
      evaluation_metrics: ["context relevance", "answer faithfulness"],
      baseline_fairness: "fair",
      experimental_assumptions: [
        "Integration of LLMs with descriptive datasets",
      ],
      inferred_details: [
        "NLP tasks: summarization and domain-specific question answering",
      ],
    },
  ],
  contradiction_report: [
    {
      contradiction_type: "unresolved",
      description:
        "Claims about the performance of large language models across different tasks and models conflict with the evidence provided in the paper.",
      paper_ids: ["paper_2c4bd07be547ebcf"],
      severity: "moderate",
      confidence: 0.8,
      linked_gap_ids: [1, 3],
    },
  ],
  evidence_strength_mapping: [
    {
      paper_id: "paper_2c4bd07be547ebcf",
      claim_index: 0,
      statistical_strength: "absent",
      replication_risk: "high",
    },
    {
      paper_id: "paper_2c4bd07be547ebcf",
      claim_index: 1,
      statistical_strength: "absent",
      replication_risk: "high",
    },
  ],
  ranked_research_gaps: [
    {
      gap_type: "unresolved_question",
      description:
        "How can general-purpose LLMs be adapted to reduce hallucinations when answering domain-specific queries, such as those related to Quranic studies?",
      related_paper_ids: ["paper_2c4bd07be547ebcf"],
      priority_score: 8,
      suggested_experiments: [
        "Investigate the effect of fine-tuning general-purpose LLMs on Quranic datasets",
        "Compare the performance of different LLM architectures on Quranic question answering tasks",
      ],
    },
    {
      gap_type: "missing_ablation",
      description:
        "What is the impact of using different descriptive datasets on the performance of LLMs in Quranic question answering tasks?",
      related_paper_ids: ["paper_2c4bd07be547ebcf"],
      priority_score: 7,
      suggested_experiments: [
        "Investigate the effect of using different descriptive datasets on LLM performance",
        "Compare the performance of LLMs on Quranic question answering tasks using different descriptive datasets",
      ],
    },
    {
      gap_type: "untested_combination",
      description:
        "What is the performance of LLMs on Quranic question answering tasks when combined with other NLP techniques, such as entity recognition or sentiment analysis?",
      related_paper_ids: ["paper_2c4bd07be547ebcf"],
      priority_score: 6,
      suggested_experiments: [
        "Investigate the effect of combining LLMs with entity recognition on Quranic question answering tasks",
        "Compare the performance of LLMs on Quranic question answering tasks when combined with sentiment analysis",
      ],
    },
    {
      gap_type: "new_direction",
      description:
        "Can LLMs be used to generate contextually faithful responses to Quranic questions by incorporating authoritative sources and descriptive datasets?",
      related_paper_ids: ["paper_2c4bd07be547ebcf"],
      priority_score: 9,
      suggested_experiments: [
        "Investigate the effect of incorporating authoritative sources on LLM performance in Quranic question answering tasks",
        "Develop a framework for generating contextually faithful responses to Quranic questions using LLMs",
      ],
    },
  ],
  actionable_experiment_suggestions: [
    {
      title: "Fine-tuning General-Purpose LLMs for Quranic Studies",
      hypothesis:
        "Fine-tuning general-purpose LLMs on Quranic datasets will reduce hallucinations and improve answer faithfulness.",
      datasets: ["Quranic surahs"],
      methods: ["Fine-tuning techniques", "Supervised learning"],
      expected_outcome:
        "Reduced hallucinations and improved answer faithfulness in LLMs when answering Quranic questions.",
      priority_score: 8,
    },
    {
      title: "Comparative Study of LLM Architectures on Quranic Question Answering",
      hypothesis:
        "Different LLM architectures perform differently on Quranic question answering tasks.",
      datasets: ["Quranic surahs"],
      methods: ["Cross-architecture comparison", "Task-specific training"],
      expected_outcome:
        "Identifying the most effective LLM architectures for Quranic question answering tasks.",
      priority_score: 7,
    },
    {
      title: "Entity Recognition Integration with LLMs for Quranic Question Answering",
      hypothesis:
        "Combining LLMs with entity recognition techniques will improve the accuracy of responses to Quranic questions.",
      datasets: ["Quranic surahs", "Entity recognition datasets"],
      methods: ["Entity recognition integration", "Cross-modal training"],
      expected_outcome:
        "Enhanced accuracy and relevance of responses to Quranic questions through entity recognition integration.",
      priority_score: 6,
    },
    {
      title: "Incorporating Authoritative Sources into LLMs for Quranic Question Answering",
      hypothesis:
        "Incorporating authoritative sources into LLMs will generate contextually faithful responses to Quranic questions.",
      datasets: ["Quranic surahs", "Authoritative religious texts"],
      methods: [
        "Incorporation of authoritative sources",
        "Context-aware training",
      ],
      expected_outcome:
        "Developing a framework for generating contextually faithful responses to Quranic questions using LLMs.",
      priority_score: 9,
    },
  ],
};
