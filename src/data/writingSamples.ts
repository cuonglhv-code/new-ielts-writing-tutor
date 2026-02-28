export type TaskId = 'task1' | 'task2'

export type VisualType = 'bar' | 'line' | 'table' | 'pie' | 'process' | 'map'

export interface WritingSample {
  id: string
  task: TaskId
  band: number
  question: string
  answer: string
  estimatedBand: number
  notes: string
  visualType?: VisualType
  visualId?: string
}

export interface WritingSamplesDataset {
  samples: WritingSample[]
}

// Representative subset extracted and flattened from IELTS Sample Bank JSON.
export const writingSamples: WritingSamplesDataset = {
  samples: [
    {
      id: 't1_b4_q1',
      task: 'task1',
      band: 4,
      question:
        'The bar chart below compares the percentage of households with internet access in four countries (Argentina, Brazil, Vietnam and Egypt) in 2000 and 2015.',
      answer:
        'The bar chart shows internet access in four different countries in 2000 and 2015. In general, it can be seen that all countries had more households with internet at the end of the period.\n\nIn 2000, Argentina had the highest figure, about 40 percent. Brazil was a bit lower, around 30 percent. Vietnam and Egypt had much lower levels, maybe around 10 percent or even less.\n\nBy 2015, the situation changed a lot. Argentina went up to nearly 80 percent and Brazil reached about 70. Vietnam also increased, but still stayed behind these two countries. Egypt rose only a little and still had the smallest percentage.\n\nTo sum up, internet became more common in every country, especially in Argentina and Brazil. Egypt stayed the lowest all the time.',
      estimatedBand: 4,
      notes: 'Basic description with weak overview, limited vocabulary and noticeable inaccuracies.',
      visualType: 'bar',
      visualId: 't1_b4_visual',
    },
    {
      id: 't1_b5_q1',
      task: 'task1',
      band: 5,
      question:
        'The table below shows the average number of hours per week that university students in three countries spent on study, part-time work and leisure in 2024.',
      answer:
        'The table compares how many hours university students in Country A, B and C spent on study, part-time jobs and leisure in one week in 2024. Overall, students in Country A studied the most, while students in Country C had the most free time.\n\nStudents in Country A spent around 30 hours per week on study, which was higher than the 25 hours in Country B and only 20 hours in Country C. For part-time work, the figures were closer. Students in Country A and B worked about 10 hours, while those in Country C worked slightly less.\n\nIn terms of leisure, the pattern was opposite. Country C students enjoyed about 25 hours of free time, compared to 20 hours for Country B and just 15 hours for Country A. This shows that when study hours are high, leisure tends to be lower.',
      estimatedBand: 5,
      notes: 'Generally addresses the task with simple overview but limited selection and repetitive language.',
      visualType: 'table',
      visualId: 't1_b5_visual',
    },
    {
      id: 't1_b6_q1',
      task: 'task1',
      band: 6,
      question:
        'The line graph below shows the number of daily journeys made by car in a European city between 1990 and 2020, with a forecast for 2030.',
      answer:
        'The line graph illustrates how many car journeys were made each day in a European city from 1990 to 2020, with predictions for 2030. Overall, the number of trips increased steadily over the period and is expected to continue rising.\n\nIn 1990, there were about 200,000 car journeys per day. This figure rose gradually to around 250,000 in 2000 and then climbed more quickly to roughly 320,000 in 2010. By 2020, the number had reached just over 350,000 journeys per day.\n\nThe graph also gives a forecast for 2030, suggesting that car use will keep growing to approximately 400,000 daily trips. This means that the city will experience about double the amount of car traffic compared with 1990.\n\nIn summary, the graph indicates a continuous upward trend in car journeys, with particularly strong growth after 2000 and a further rise expected in the future.',
      estimatedBand: 6,
      notes: 'Adequate overview and clear organisation, with some simplification and limited lexical range.',
      visualType: 'line',
      visualId: 't1_b6_visual',
    },
    {
      id: 't1_b7_q1',
      task: 'task1',
      band: 7,
      question:
        'The two pie charts below show the percentage of electricity produced from different sources (coal, natural gas, nuclear, renewables and other) in Country X in 2000 and 2025.',
      answer:
        'The pie charts compare how electricity was generated in Country X in 2000 and how it is projected to be produced in 2025. Overall, the country is expected to rely less on fossil fuels and more on nuclear and renewable energy by 2025.\n\nIn 2000, coal was the dominant source, accounting for 45% of electricity production, while natural gas supplied a further 30%. Nuclear power contributed 10%, renewables made up 8%, and the remaining 7% came from other sources.\n\nBy 2025, coal is predicted to fall sharply to 20%, and natural gas to 15%. In contrast, nuclear power is expected to rise to 25%, becoming the single largest source. Renewables are forecast to grow significantly to 30%, overtaking both coal and gas. The share of other sources is projected to remain relatively stable at 10%.\n\nOverall, the charts suggest a clear shift away from coal and gas towards cleaner and more sustainable forms of energy.',
      estimatedBand: 7,
      notes: 'Clear overview, good grouping of data and generally accurate, flexible language.',
      visualType: 'pie',
      visualId: 't1_b7_visual',
    },
    {
      id: 't1_b8_q1',
      task: 'task1',
      band: 8,
      question:
        'The diagram below shows the stages in the production of bottled orange juice, from fresh fruit to distribution in supermarkets.',
      answer:
        'The diagram outlines the process of producing bottled orange juice, from picking the fruit to delivering the final product to supermarkets. Overall, it is a multi-stage process that involves preparation, processing, storage and distribution.\n\nFirst, ripe oranges are harvested from farms and transported by truck to a processing plant. There, the fruit is washed and checked for quality before being fed into a machine that squeezes the juice out. The remaining peel and pulp are removed and either discarded or used for animal feed.\n\nNext, the fresh juice is filtered and then pasteurised by heating it to a high temperature for a short time to kill bacteria. Once pasteurised, it is pumped into large stainless steel tanks where it can be stored until needed. When orders arrive, the juice is poured into sterilised bottles, sealed and labelled by an automated bottling line.\n\nFinally, the finished bottles are packed into crates and loaded onto refrigerated lorries, which deliver them to supermarkets for sale.',
      estimatedBand: 8,
      notes:
        'Fully developed process description with precise lexis and strong control of passive and complex forms.',
      visualType: 'process',
      visualId: 't1_b8_visual',
    },
    {
      id: 't1_b9_q1',
      task: 'task1',
      band: 9,
      question:
        'The two maps below show the same coastal town in 1995 and today. They illustrate changes that have taken place as the town has developed into a tourist resort.',
      answer:
        'The two maps present a coastal town as it was in 1995 and as it appears today, after substantial development into a tourist destination. Overall, the town has been transformed from a small fishing community into a much more built-up area with extensive visitor facilities, while the beach itself has been preserved.\n\nIn 1995, the town consisted mainly of a small harbour for fishing boats, a handful of houses, and a narrow country road running parallel to the coast. There was a large area of woodland to the north and open fields to the east. Tourist infrastructure was limited to a single guesthouse near the beach.\n\nToday, the harbour has been removed and replaced by a modern marina, and the original road has been widened and converted into a dual carriageway. Several blocks of apartments and a large hotel now occupy the former fields, and a shopping complex has been built where some of the woodland used to be. However, the sandy beach remains free of buildings, and a newly created pedestrian promenade allows visitors to enjoy the coastline without traffic.',
      estimatedBand: 9,
      notes:
        'Insightful overview, highly selective detail and very natural, precise language with sophisticated cohesion.',
      visualType: 'map',
      visualId: 't1_b9_visual',
    },
    {
      id: 't2_b4_q1',
      task: 'task2',
      band: 4,
      question:
        'In many cities, traffic congestion is becoming a serious problem. To what extent do you agree or disagree that building more roads is the best way to reduce traffic jams?',
      answer:
        'Nowadays, in many cities there are a lot of cars and traffic jams is a big problem. Some people think the government should build more roads to solve this. I partly agree with this idea but I think it is not the only way.\n\nFirstly, if there are more roads, it is true that cars can move to other streets and maybe traffic is less in one place. For example, in my city, a new bridge reduced the traffic in the old bridge. However, after some months, more and more people bought cars and the problem come back again. So building roads is only a short solution.\n\nSecondly, the government should also improve public transport. If there are fast and cheap buses and trains, people will not need to drive their cars every day. They can leave the car at home and use the bus. Also, the government should make rules about parking in the city centre.\n\nIn conclusion, I think building more roads can help but it is not enough, and the government must do other things too.',
      estimatedBand: 4,
      notes: 'Addresses topic but with limited development, weak coherence and frequent language errors.',
    },
    {
      id: 't2_b5_q1',
      task: 'task2',
      band: 5,
      question:
        'More and more young people are choosing to take a gap year before starting university. Do the advantages of taking a gap year outweigh the disadvantages?',
      answer:
        'Many students nowadays decide to take a year off before they go to university. This is called a gap year. In my opinion, taking a gap year has both benefits and drawbacks, and whether it is good or not depends on the person.\n\nOn the one hand, a gap year can be a good chance for young people to travel or work. They can visit other countries, learn new cultures and improve their language skills. Some students get a job and save money for their studies. This can make them more independent when they start university.\n\nOn the other hand, there are also some problems. Some students become lazy during the gap year and just stay at home playing games. They may lose their study habits and find it hard to go back to school. In addition, if they travel too much, they may spend a lot of money and have debts later.\n\nIn conclusion, a gap year has some clear advantages but also serious disadvantages. Students should think carefully and make a plan before they decide.',
      estimatedBand: 5,
      notes: 'Covers both sides with simple but relevant ideas, yet lacks depth and shows noticeable errors.',
    },
    {
      id: 't2_b6_q1',
      task: 'task2',
      band: 6,
      question:
        'Many people believe that governments should invest more money in public parks and sports facilities rather than in shopping centres. To what extent do you agree or disagree?',
      answer:
        "It is often argued that governments ought to spend more public money on parks and sports facilities instead of on shopping centres. I mostly agree with this view, although I believe that commercial areas can also bring some benefits to a city.\n\nTo begin with, public parks and sports facilities can improve people's physical and mental health. Parks provide green spaces where residents can relax, walk and enjoy fresh air, which is especially important for those who live in small apartments. Sports centres give citizens the opportunity to exercise regularly at an affordable price. As a result, the general level of fitness in the community is likely to increase, and healthcare systems may face less pressure.\n\nHowever, shopping centres also play a role in modern cities. They create jobs for local people, from shop assistants to cleaners, and they generate tax income for the government. In addition, they offer a convenient place for citizens to buy products and socialise with friends and family. Without enough commercial areas, a city might struggle economically.\n\nIn conclusion, I believe that governments should give priority to parks and sports facilities because of their direct impact on public health, but they should also ensure that there are sufficient shopping centres to support the local economy.",
      estimatedBand: 6,
      notes:
        'Clear opinion and generally coherent structure with adequate development and some grammatical inaccuracy.',
    },
    {
      id: 't2_b7_q1',
      task: 'task2',
      band: 7,
      question:
        'Some people think that children should start learning a foreign language in primary school, while others believe it is better to begin in secondary school. Discuss both views and give your own opinion.',
      answer:
        'It is sometimes argued that children ought to begin learning a foreign language at primary school rather than waiting until secondary school. While there are some disadvantages to introducing languages at an early age, I believe the benefits are far greater.\n\nOn the one hand, starting language learning in primary school may put extra pressure on young children. They are already adjusting to basic literacy and numeracy, and adding another subject could make school seem stressful. In addition, primary teachers may not always be language specialists, which means that the quality of instruction can vary considerably between schools.\n\nOn the other hand, there are strong arguments in favour of early language learning. Young children tend to be more flexible and less afraid of making mistakes, so they often develop better pronunciation and listening skills. If they are exposed to a new language from the age of six or seven, they have many more years to practise before important exams. Furthermore, early language education can help children become more open-minded about other cultures.\n\nIn my view, the advantages of starting in primary school outweigh the drawbacks, provided that lessons are enjoyable and age-appropriate. Governments should therefore invest in training primary teachers so that they can deliver high-quality language classes.',
      estimatedBand: 7,
      notes:
        'Addresses all parts with a clear position, good development and generally accurate, flexible language.',
    },
    {
      id: 't2_b8_q1',
      task: 'task2',
      band: 8,
      question:
        'In many countries, people are living longer than ever before. What problems does this cause for individuals and society? What measures could be taken to deal with these problems?',
      answer:
        'Improvements in medicine and living standards mean that people in many countries are now living longer than at any time in history. While this trend is a sign of progress, it also creates a number of challenges for both individuals and society. However, there are several measures that governments and communities can take to address these issues.\n\nOne major problem is the pressure on pension systems and healthcare services. As the proportion of retired people increases, fewer working-age adults have to support more elderly citizens through taxes. This can result in higher retirement ages and reduced pensions, which may cause financial insecurity for some older people. In addition, older populations tend to require more medical care, placing extra strain on hospitals and clinics.\n\nTo tackle these problems, governments could encourage older people who are still healthy to remain in the workforce longer, perhaps through part-time or flexible jobs. This would allow them to continue contributing economically while staying active. At the same time, investment in preventive healthcare, such as regular screenings and fitness programmes, could help seniors remain independent for longer. Communities can also play a role by developing age-friendly public spaces and volunteer schemes that reduce social isolation among the elderly.\n\nIn conclusion, although longer life expectancy brings challenges, sensible policies and community initiatives can ensure that ageing populations remain both sustainable and socially inclusive.',
      estimatedBand: 8,
      notes:
        'Well-balanced problem-solution essay with clear progression, precise lexis and highly accurate complex grammar.',
    },
    {
      id: 't2_b9_q1',
      task: 'task2',
      band: 9,
      question:
        'Some people argue that working from home benefits employees more than employers. To what extent do you agree or disagree?',
      answer:
        'The rapid development of digital technology has made working from home a realistic option for millions of employees. While it is often claimed that this arrangement mainly benefits workers, I would argue that, when managed well, remote work can be equally advantageous for employers.\n\nOn the one hand, there is no doubt that employees gain several important benefits from home working. They can avoid long and stressful commutes, which saves time and reduces transport costs. This extra time can be used for family, exercise or rest, all of which may improve their overall well-being. Furthermore, many people find that they are more productive in a quiet home environment, where they can organise their schedule around their most focused hours.\n\nOn the other hand, employers can also reap significant rewards. Companies that allow remote work are able to recruit from a wider geographical area, giving them access to a larger talent pool. They can also reduce expenses related to office space, such as rent and utilities. Perhaps most importantly, when staff are trusted to manage their own time, this can increase motivation and loyalty, leading to lower staff turnover. Of course, remote work does present challenges, such as the need for clear communication and strong data security, but these can be addressed through appropriate policies and technology.\n\nIn conclusion, although working from home undoubtedly benefits employees, it also offers substantial advantages for employers. For this reason, I believe that remote work, if properly supported, is a win-win arrangement.',
      estimatedBand: 9,
      notes:
        'Sophisticated, well-argued response with natural cohesion, wide lexical range and near-perfect grammatical control.',
    },
  ],
}

