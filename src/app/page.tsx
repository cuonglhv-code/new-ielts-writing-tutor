"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

const JAX = "#f97316";
const CHART_TYPES = ["Bar Chart", "Line Graph", "Pie Chart", "Table", "Process Diagram", "Map Comparison"];
const TASK2_TYPES = ["Opinion (Agree/Disagree)", "Discussion (Both Views)", "Problem & Solution", "Advantages & Disadvantages", "Two-Part Question"];
const TOPICS = ["Education", "Technology", "Environment", "Health", "Society", "Economy", "Transport", "Culture", "Crime", "Media", "Other"];
const DIFFICULTIES = ["Band 5–6", "Band 6–7", "Band 7–8"];
const VISUAL_TYPES = ["Bar Chart", "Line Graph", "Pie Chart", "Table"];
const COLORS = ["#f97316", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
const STAFF_PIN = "jaxtina2026";
const STORAGE_KEY = "jaxtina_ielts_qbank_v2";
const uid = () => Math.random().toString(36).slice(2, 9);
const bandColor = (b) => b >= 7.5 ? "#10b981" : b >= 6.5 ? "#3b82f6" : b >= 5.5 ? "#f59e0b" : "#ef4444";
const criteriaKeys = [
  { key: "TA", label: "Task Achievement" },
  { key: "CC", label: "Coherence & Cohesion" },
  { key: "LR", label: "Lexical Resource" },
  { key: "GRA", label: "Grammatical Range & Accuracy" }
];
const BAND_DESC = {
  5: { TA: "Incompletely addressed.", CC: "Not fully logical.", LR: "Limited range; frequent errors.", GRA: "Limited structures; frequent errors." },
  6: { TA: "Main parts addressed but unevenly.", CC: "Generally coherent; mechanical.", LR: "Adequate range; some imprecision.", GRA: "Mix of forms; accuracy drops in complex sentences." },
  7: { TA: "Appropriately addressed; clear position.", CC: "Logically organised; cohesion flexible.", LR: "Sufficient range; less common items used.", GRA: "Variety of complex structures; well controlled." },
  8: { TA: "Well-developed position.", CC: "Logically sequenced; well managed.", LR: "Wide resource; fluent and flexible.", GRA: "Wide range; majority error-free." }
};

const SEED = [
  {
    id: "s1", task: "Task 1", chartType: "Bar Chart", topic: "Society", difficulty: "Band 6–7",
    question: "The bar chart below compares the average consumer spending (in US dollars) on food, clothing and electronics in four countries in 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartData: {
      title: "Consumer Spending by Category and Country (2020, USD)", xAxisLabel: "Country", yAxisLabel: "USD per person", unit: "USD",
      series: [
        { name: "Food", color: "#f97316", data: [{ label: "UK", value: 2800 }, { label: "Germany", value: 2600 }, { label: "France", value: 2900 }, { label: "Japan", value: 2200 }] },
        { name: "Clothing", color: "#3b82f6", data: [{ label: "UK", value: 1400 }, { label: "Germany", value: 1100 }, { label: "France", value: 1500 }, { label: "Japan", value: 900 }] },
        { name: "Electronics", color: "#10b981", data: [{ label: "UK", value: 1800 }, { label: "Germany", value: 1600 }, { label: "France", value: 1300 }, { label: "Japan", value: 2100 }] }
      ],
      keyFeatures: ["UK and France are the highest food and clothing spenders", "Japan leads in electronics", "Germany is the lowest overall spender"]
    }
  },
  {
    id: "s2", task: "Task 1", chartType: "Line Graph", topic: "Technology", difficulty: "Band 6–7",
    question: "The line graph below shows the percentage of the population using the internet in four countries between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartData: {
      title: "Internet Users as a % of Population (2000–2020)", xAxisLabel: "Year", yAxisLabel: "% of population", unit: "%",
      series: [
        { name: "USA", color: "#3b82f6", data: [{ label: "2000", value: 44 }, { label: "2005", value: 68 }, { label: "2010", value: 79 }, { label: "2015", value: 88 }, { label: "2020", value: 93 }] },
        { name: "UK", color: "#f97316", data: [{ label: "2000", value: 40 }, { label: "2005", value: 63 }, { label: "2010", value: 79 }, { label: "2015", value: 89 }, { label: "2020", value: 95 }] },
        { name: "Brazil", color: "#10b981", data: [{ label: "2000", value: 3 }, { label: "2005", value: 12 }, { label: "2010", value: 37 }, { label: "2015", value: 58 }, { label: "2020", value: 74 }] },
        { name: "India", color: "#f59e0b", data: [{ label: "2000", value: 1 }, { label: "2005", value: 2 }, { label: "2010", value: 7 }, { label: "2015", value: 23 }, { label: "2020", value: 50 }] }
      ],
      keyFeatures: ["USA and UK consistently higher throughout", "India and Brazil rose sharply after 2010", "UK overtook USA by 2020"]
    }
  },
  {
    id: "s3", task: "Task 1", chartType: "Line Graph", topic: "Economy", difficulty: "Band 7–8",
    question: "The graph below gives information about average house prices in five major cities between 2000 and 2022. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartData: {
      title: "Average House Prices – Five Cities (USD thousands, 2000–2022)", xAxisLabel: "Year", yAxisLabel: "USD (thousands)", unit: "$k",
      series: [
        { name: "London", color: "#3b82f6", data: [{ label: "2000", value: 210 }, { label: "2005", value: 280 }, { label: "2010", value: 310 }, { label: "2015", value: 460 }, { label: "2022", value: 580 }] },
        { name: "Sydney", color: "#f97316", data: [{ label: "2000", value: 185 }, { label: "2005", value: 260 }, { label: "2010", value: 330 }, { label: "2015", value: 490 }, { label: "2022", value: 720 }] },
        { name: "New York", color: "#10b981", data: [{ label: "2000", value: 195 }, { label: "2005", value: 370 }, { label: "2010", value: 340 }, { label: "2015", value: 450 }, { label: "2022", value: 640 }] },
        { name: "Tokyo", color: "#f59e0b", data: [{ label: "2000", value: 280 }, { label: "2005", value: 270 }, { label: "2010", value: 265 }, { label: "2015", value: 290 }, { label: "2022", value: 360 }] },
        { name: "Mumbai", color: "#8b5cf6", data: [{ label: "2000", value: 60 }, { label: "2005", value: 90 }, { label: "2010", value: 150 }, { label: "2015", value: 190 }, { label: "2022", value: 260 }] }
      ],
      keyFeatures: ["Sydney experienced the sharpest rise", "Tokyo remained relatively stable", "New York dipped slightly in 2010", "Mumbai showed consistent modest growth"]
    }
  },
  {
    id: "s4", task: "Task 1", chartType: "Pie Chart", topic: "Society", difficulty: "Band 5–6",
    question: "The pie chart below shows how a sample of 1,000 adults in the UK spent their leisure time in a typical week in 2022. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartData: {
      title: "UK Adult Leisure Time Breakdown (2022)", unit: "%",
      series: [{ name: "Leisure", data: [{ label: "Watching TV/Streaming", value: 32 }, { label: "Social Media", value: 22 }, { label: "Sport/Exercise", value: 16 }, { label: "Reading", value: 12 }, { label: "Socialising", value: 10 }, { label: "Hobbies", value: 8 }] }],
      keyFeatures: ["TV/Streaming accounts for nearly a third", "TV + Social Media together exceed half", "Sport ranks third at 16%", "Hobbies is the smallest at 8%"]
    }
  },
  {
    id: "s5", task: "Task 1", chartType: "Table", topic: "Society", difficulty: "Band 7–8",
    question: "The table below shows the average number of hours that men and women in the UK spent on different daily activities in 2021. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartData: {
      title: "Average Daily Hours by Activity and Gender – UK 2021", unit: "hrs",
      series: [
        { name: "Employment/Study", data: [{ label: "Men", value: 4.9 }, { label: "Women", value: 3.5 }] },
        { name: "Leisure", data: [{ label: "Men", value: 5.4 }, { label: "Women", value: 4.9 }] },
        { name: "Household/Childcare", data: [{ label: "Men", value: 2.3 }, { label: "Women", value: 3.8 }] },
        { name: "Sleep", data: [{ label: "Men", value: 8.1 }, { label: "Women", value: 8.3 }] },
        { name: "Eating/Personal care", data: [{ label: "Men", value: 3.3 }, { label: "Women", value: 3.5 }] }
      ],
      keyFeatures: ["Men spend more time in employment/study", "Women spend more time on household duties", "Sleep is the largest block for both", "Leisure time is broadly similar"]
    }
  },
  {
    id: "s6", task: "Task 2", essayType: "Opinion (Agree/Disagree)", topic: "Education", difficulty: "Band 6–7",
    question: "Some people believe that children should be taught to be competitive at school. Others think it is more important to teach them to co-operate with others. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience.", chartData: null
  },
  {
    id: "s7", task: "Task 2", essayType: "Opinion (Agree/Disagree)", topic: "Technology", difficulty: "Band 6–7",
    question: "Some people think that space exploration is a waste of money and that this money should be spent on solving problems on Earth. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience.", chartData: null
  },
  {
    id: "s8", task: "Task 2", essayType: "Discussion (Both Views)", topic: "Society", difficulty: "Band 7–8",
    question: "Some people argue that it is better to live in a large city, while others believe that life in a small town or rural area is preferable. Discuss both views and give your own opinion.", chartData: null
  },
  {
    id: "s9", task: "Task 2", essayType: "Discussion (Both Views)", topic: "Education", difficulty: "Band 6–7",
    question: "Some people think that children should study at home rather than attend school. Others believe that schools are the best places for children to receive an education. Discuss both views and give your own opinion.", chartData: null
  },
  {
    id: "s10", task: "Task 2", essayType: "Problem & Solution", topic: "Transport", difficulty: "Band 6–7",
    question: "Traffic congestion is becoming a major problem in many cities around the world. What are the main causes of traffic congestion? What measures could governments and individuals take to address this problem?", chartData: null
  },
  {
    id: "s11", task: "Task 2", essayType: "Advantages & Disadvantages", topic: "Society", difficulty: "Band 6–7",
    question: "More and more people are choosing to live alone nowadays. Do you think the advantages of living alone outweigh the disadvantages? Give reasons for your answer and include any relevant examples from your own knowledge or experience.", chartData: null
  },
  {
    id: "s12", task: "Task 2", essayType: "Two-Part Question", topic: "Technology", difficulty: "Band 6–7",
    question: "Many children spend a great amount of time using the internet every day. Why is this the case? Do you think this is a positive or negative development? Give reasons for your answer and include any relevant examples from your own knowledge or experience.", chartData: null
  },
  {
    id: "s13", task: "Task 2", essayType: "Two-Part Question", topic: "Education", difficulty: "Band 7–8",
    question: "More and more students are choosing to study abroad rather than at universities in their home country. Why do students choose to study abroad? Is this a positive or negative development? Give reasons for your answer and include any relevant examples from your own knowledge or experience.", chartData: null
  }
];

async function loadBank() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; }
}
async function saveBank(q) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(q)); } catch (e) { }
}

function getVal(series, si, i) {
  var s = series[si];
  if (!s) return 0;
  var d = s.data[i];
  if (!d) return 0;
  return d.value || 0;
}

function renderBar(cd) {
  var labels = cd.series[0].data.map(function (d) { return d.label; });
  var data = labels.map(function (lbl, i) {
    var row = { label: lbl };
    cd.series.forEach(function (s) { row[s.name] = (s.data[i] && s.data[i].value) ? s.data[i].value : 0; });
    return row;
  });
  return (
    <div>
      <div className="text-xs text-center text-gray-400 mb-1 font-medium">{cd.title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 9 }} />
          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 10, color: "#9ca3af" }} />
          {cd.series.map(function (s, i) { return <Bar key={s.name} dataKey={s.name} fill={s.color || COLORS[i]} radius={[3, 3, 0, 0]} />; })}
        </BarChart>
      </ResponsiveContainer>
      {cd.xAxisLabel && <div className="text-xs text-center text-gray-500 mt-1">{cd.xAxisLabel}</div>}
    </div>
  );
}

function renderLine(cd) {
  var labels = cd.series[0].data.map(function (d) { return d.label; });
  var data = labels.map(function (lbl, i) {
    var row = { label: lbl };
    cd.series.forEach(function (s) { row[s.name] = (s.data[i] && s.data[i].value) ? s.data[i].value : 0; });
    return row;
  });
  return (
    <div>
      <div className="text-xs text-center text-gray-400 mb-1 font-medium">{cd.title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 9 }} />
          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 10, color: "#9ca3af" }} />
          {cd.series.map(function (s, i) { return <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color || COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />; })}
        </LineChart>
      </ResponsiveContainer>
      {cd.xAxisLabel && <div className="text-xs text-center text-gray-500 mt-1">{cd.xAxisLabel}</div>}
    </div>
  );
}

function renderPie(cd) {
  var data = cd.series[0].data.map(function (d, i) { return { name: d.label, value: d.value, fill: COLORS[i % COLORS.length] }; });
  return (
    <div>
      <div className="text-xs text-center text-gray-400 mb-1 font-medium">{cd.title}</div>
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={75} dataKey="value"
            label={function (p) { return p.name + ": " + p.value + "%"; }}
            labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}>
            {data.map(function (d, i) { return <Cell key={i} fill={d.fill} />; })}
          </Pie>
          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function renderTable(cd) {
  var cols = cd.series[0].data.map(function (d) { return d.label; });
  return (
    <div className="overflow-x-auto">
      <div className="text-xs text-center text-gray-400 mb-2 font-medium">{cd.title}</div>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left border border-gray-600 font-semibold text-orange-300" style={{ background: "#431407" }}>Category</th>
            {cols.map(function (c) { return <th key={c} className="px-3 py-2 border border-gray-600 font-semibold text-center text-orange-300" style={{ background: "#431407" }}>{c}</th>; })}
          </tr>
        </thead>
        <tbody>
          {cd.series.map(function (s, i) {
            return (
              <tr key={s.name} className={i % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}>
                <td className="px-3 py-2 border border-gray-700 font-medium text-gray-300">{s.name}</td>
                {s.data.map(function (d, j) { return <td key={j} className="px-3 py-2 border border-gray-700 text-center text-gray-300">{d.value}</td>; })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ChartVisual(props) {
  var chartType = props.chartType;
  var chartData = props.chartData;
  if (!chartData) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 mt-3">
      {chartType === "Bar Chart" && renderBar(chartData)}
      {chartType === "Line Graph" && renderLine(chartData)}
      {chartType === "Pie Chart" && renderPie(chartData)}
      {chartType === "Table" && renderTable(chartData)}
      {chartData.keyFeatures && chartData.keyFeatures.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-500 mb-1 font-medium">Key features to cover:</div>
          <div className="flex flex-wrap gap-1">
            {chartData.keyFeatures.map(function (f, i) {
              return <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#431407", color: "#fdba74" }}>{f}</span>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img src="https://jaxtina.com/wp-content/themes/jax2024/img/logo.svg" alt="Jaxtina"
        style={{ height: 26, objectFit: "contain" }}
        onError={function (e) { e.target.style.display = "none"; }} />
      <span className="font-extrabold text-base" style={{ color: JAX }}>JAXTINA</span>
    </div>
  );
}

function buildGenPrompt(chartType, taskType, subtype) {
  var isVis = VISUAL_TYPES.indexOf(chartType) >= 0;
  var simon = "Follow Simon's IELTS approach: realistic data with a clear story, obvious trends, exam-level wording.";
  if (taskType === "Task 2") {
    return "Generate a realistic Academic IELTS Task 2 \"" + subtype + "\" question. " + simon + "\nRespond ONLY with valid JSON (no markdown):\n{\"question\":\"Full question\",\"chartType\":null,\"chartData\":null}";
  }
  if (!isVis) {
    return "Generate a realistic Academic IELTS Task 1 \"" + chartType + "\" question. " + simon + "\nRespond ONLY with valid JSON (no markdown):\n{\"question\":\"Full question\",\"chartType\":\"" + chartType + "\",\"chartData\":null}";
  }
  return "Generate a realistic Academic IELTS Task 1 \"" + chartType + "\" question. " + simon + " Include 2-4 series, 5-7 data points each.\nRespond ONLY with valid JSON (no markdown):\n{\"question\":\"The [chartType] below shows [description]. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\",\"chartType\":\"" + chartType + "\",\"chartData\":{\"title\":\"Chart title\",\"xAxisLabel\":\"X label\",\"yAxisLabel\":\"Y label\",\"unit\":\"%\",\"series\":[{\"name\":\"Series\",\"color\":\"#f97316\",\"data\":[{\"label\":\"A\",\"value\":42}]}],\"keyFeatures\":[\"Feature 1\",\"Feature 2\"]}}";
}

function buildFeedbackPrompt(taskType, chartType, question, chartData, answer, targetBand, history) {
  var near = [5, 6, 7, 8].reduce(function (p, c) { return Math.abs(c - targetBand) < Math.abs(p - targetBand) ? c : p; }, 6);
  var d = BAND_DESC[near];
  var hist = history.length > 0 ? history.map(function (h, i) { return "Attempt " + (i + 1) + ": " + h.overall; }).join(", ") : "none";
  var chartCtx = chartData ? "\nChart data: " + JSON.stringify(chartData) : "";
  return "You are a strict IELTS examiner. Mark this Academic IELTS " + taskType + (chartType ? " (" + chartType + ")" : "") + ". Target: Band " + targetBand + ". Previous: " + hist + ".\nBand " + near + ": TA:" + d.TA + " CC:" + d.CC + " LR:" + d.LR + " GRA:" + d.GRA + "\nQUESTION: " + question + chartCtx + "\nSTUDENT: " + answer + "\nRespond ONLY with valid JSON (no markdown):\n{\"scores\":{\"TA\":6.0,\"CC\":6.0,\"LR\":6.0,\"GRA\":6.0},\"overall\":6.0,\"examinerSummary\":\"2-3 sentences\",\"strengths\":[\"strength\"],\"improvements\":[{\"issue\":\"label\",\"criterion\":\"TA\",\"original\":\"quote\",\"improved\":\"better version\",\"explanation\":\"why\"}]" + (chartData ? ",\"dataAccuracy\":\"comment on overview and data accuracy\"" : "") + ",\"vocabHighlights\":[\"word\"],\"examTip\":\"one tip\"}\nScores from [4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9]. overall = mean rounded to 0.5.";
}

var emptyQ = function () {
  return {
    id: uid(), task: "Task 1", chartType: "Bar Chart", essayType: TASK2_TYPES[0],
    topic: "Education", difficulty: "Band 6–7", question: "",
    chartData: {
      title: "", xAxisLabel: "", yAxisLabel: "", unit: "",
      series: [{ name: "Series 1", color: COLORS[0], data: [{ label: "", value: "" }, { label: "", value: "" }] }],
      keyFeatures: ["", "", ""]
    }
  };
};

function QBankManager(props) {
  var questions = props.questions;
  var onSave = props.onSave;
  var onDelete = props.onDelete;
  var onClose = props.onClose;
  var [view, setView] = useState("list");
  var [ed, setEd] = useState(null);
  var [filterTask, setFilterTask] = useState("All");
  var [filterTopic, setFilterTopic] = useState("All");
  var [confirmDel, setConfirmDel] = useState(null);

  var filtered = questions.filter(function (q) {
    return (filterTask === "All" || q.task === filterTask) && (filterTopic === "All" || q.topic === filterTopic);
  });

  function upd(path, val) {
    setEd(function (prev) {
      var n = JSON.parse(JSON.stringify(prev));
      var keys = path.split(".");
      var o = n;
      for (var i = 0; i < keys.length - 1; i++) o = o[keys[i]];
      o[keys[keys.length - 1]] = val;
      return n;
    });
  }

  function save() {
    if (!ed.question.trim()) { alert("Please enter a question."); return; }
    onSave(ed); setView("list"); setEd(null);
  }

  if (view === "edit" && ed) return (
    <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={function () { setView("list"); setEd(null); }} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">← Back</button>
        <span className="text-sm font-bold text-white ml-1">{questions.find(function (q) { return q.id === ed.id; }) ? "✏️ Edit Question" : "➕ New Question"}</span>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block font-semibold uppercase tracking-wider">Task Type</label>
          <div className="flex gap-2">
            {["Task 1", "Task 2"].map(function (t) {
              return <button key={t} onClick={function () { upd("task", t); }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all"
                style={ed.task === t ? { background: "linear-gradient(135deg,#f97316,#ea580c)", border: "1px solid #f97316", color: "white" } : { background: "#1f2937", border: "1px solid #374151", color: "#6b7280" }}>{t}</button>;
            })}
          </div>
        </div>
        {ed.task === "Task 1" ? (
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-semibold uppercase tracking-wider">Chart Type</label>
            <div className="flex flex-wrap gap-1.5">
              {CHART_TYPES.map(function (t) {
                return <button key={t} onClick={function () { upd("chartType", t); }}
                  className="px-3 py-1.5 rounded-full text-xs border transition-all"
                  style={ed.chartType === t ? { background: "#f9731633", border: "1px solid #f97316", color: "#f97316" } : { background: "#1f2937", border: "1px solid #374151", color: "#6b7280" }}>{t}</button>;
              })}
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-semibold uppercase tracking-wider">Essay Type</label>
            <div className="flex flex-wrap gap-1.5">
              {TASK2_TYPES.map(function (t) {
                return <button key={t} onClick={function () { upd("essayType", t); }}
                  className="px-3 py-1.5 rounded-full text-xs border transition-all"
                  style={ed.essayType === t ? { background: "#f9731633", border: "1px solid #f97316", color: "#f97316" } : { background: "#1f2937", border: "1px solid #374151", color: "#6b7280" }}>{t}</button>;
              })}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-semibold">Topic</label>
            <select value={ed.topic} onChange={function (e) { upd("topic", e.target.value); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
              {TOPICS.map(function (t) { return <option key={t}>{t}</option>; })}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-semibold">Difficulty</label>
            <select value={ed.difficulty} onChange={function (e) { upd("difficulty", e.target.value); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
              {DIFFICULTIES.map(function (d) { return <option key={d}>{d}</option>; })}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block font-semibold">Question Text</label>
          <textarea value={ed.question} onChange={function (e) { upd("question", e.target.value); }} rows={5}
            placeholder="Enter the full IELTS question as it appears in the exam…"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-500 resize-none focus:outline-none" />
        </div>
        {ed.task === "Task 1" && VISUAL_TYPES.indexOf(ed.chartType) >= 0 && (
          <div className="rounded-xl p-4 space-y-3 border" style={{ background: "#0f0f1a", borderColor: "#7c2d12" }}>
            <div className="text-xs font-bold" style={{ color: JAX }}>📊 Chart Data Builder</div>
            <div className="grid grid-cols-2 gap-2">
              {[["Chart Title", "title", "e.g. Internet Users 2020"], ["Unit", "unit", "%, million…"]].map(function (arr) {
                return <div key={arr[1]}><label className="text-xs text-gray-500 mb-1 block">{arr[0]}</label>
                  <input value={ed.chartData[arr[1]]} onChange={function (e) { upd("chartData." + arr[1], e.target.value); }}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none" placeholder={arr[2]} /></div>;
              })}
              {ed.chartType !== "Pie Chart" && [["X-Axis Label", "xAxisLabel", "e.g. Country"], ["Y-Axis Label", "yAxisLabel", "e.g. Percentage (%)"]].map(function (arr) {
                return <div key={arr[1]}><label className="text-xs text-gray-500 mb-1 block">{arr[0]}</label>
                  <input value={ed.chartData[arr[1]]} onChange={function (e) { upd("chartData." + arr[1], e.target.value); }}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none" placeholder={arr[2]} /></div>;
              })}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-500 font-medium">Data</label>
                <div className="flex gap-3">
                  <button onClick={function () { setEd(function (p) { var n = JSON.parse(JSON.stringify(p)); n.chartData.series.forEach(function (s) { s.data.push({ label: "", value: "" }); }); return n; }); }} className="text-xs transition-colors" style={{ color: JAX }}>+ Column</button>
                  {ed.chartType !== "Pie Chart" && <button onClick={function () { setEd(function (p) { var n = JSON.parse(JSON.stringify(p)); n.chartData.series.push({ name: "Series " + (n.chartData.series.length + 1), color: COLORS[n.chartData.series.length % COLORS.length], data: n.chartData.series[0].data.map(function (d) { return { label: d.label, value: "" }; }) }); return n; }); }} className="text-xs transition-colors" style={{ color: JAX }}>+ Row</button>}
                </div>
              </div>
              <div className="flex gap-1 mb-1 ml-20">
                {ed.chartData.series[0].data.map(function (d, i) {
                  return (
                    <div key={i} className="flex-1 flex gap-0.5">
                      <input value={d.label} onChange={function (e) { var v = e.target.value; setEd(function (p) { var n = JSON.parse(JSON.stringify(p)); n.chartData.series.forEach(function (s) { s.data[i].label = v; }); return n; }); }}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded px-1 py-1 text-xs text-white focus:outline-none min-w-0" placeholder={"Col " + (i + 1)} />
                      {ed.chartData.series[0].data.length > 2 && <button onClick={function () { setEd(function (p) { var n = JSON.parse(JSON.stringify(p)); n.chartData.series.forEach(function (s) { s.data.splice(i, 1); }); return n; }); }} className="text-red-500 text-xs px-0.5">×</button>}
                    </div>
                  );
                })}
              </div>
              {ed.chartData.series.map(function (s, si) {
                return (
                  <div key={si} className="flex gap-1 mb-1 items-center">
                    <div className="w-20 shrink-0">
                      <input value={s.name} onChange={function (e) { upd("chartData.series." + si + ".name", e.target.value); }}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-1 py-1 text-xs text-white focus:outline-none" placeholder={"Row " + (si + 1)} />
                    </div>
                    {s.data.map(function (d, i) {
                      return <input key={i} value={d.value} onChange={function (e) { upd("chartData.series." + si + ".data." + i + ".value", Number(e.target.value)); }} type="number"
                        className="flex-1 bg-gray-900 border border-gray-700 rounded px-1 py-1 text-xs text-white focus:outline-none min-w-0" />;
                    })}
                    {ed.chartData.series.length > 1 && <button onClick={function () { setEd(function (p) { var n = JSON.parse(JSON.stringify(p)); n.chartData.series.splice(si, 1); return n; }); }} className="text-red-500 text-xs px-1">×</button>}
                  </div>
                );
              })}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Key Features</label>
              {ed.chartData.keyFeatures.map(function (f, i) {
                return <input key={i} value={f} onChange={function (e) { upd("chartData.keyFeatures." + i, e.target.value); }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white mb-1 focus:outline-none" placeholder={"Feature " + (i + 1) + "…"} />;
              })}
            </div>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={save} className="flex-1 py-2.5 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>💾 Save Question</button>
          <button onClick={function () { setView("list"); setEd(null); }} className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 rounded-xl text-sm hover:bg-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2 shrink-0">
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">← Back</button>
        <span className="text-sm font-bold text-white flex-1">Question Bank Manager</span>
        <button onClick={function () { setEd(emptyQ()); setView("edit"); }} className="text-xs text-white px-3 py-1.5 rounded-lg font-bold hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>+ New</button>
      </div>
      <div className="px-4 py-2 border-b border-gray-800 flex gap-2 flex-wrap shrink-0">
        <select value={filterTask} onChange={function (e) { setFilterTask(e.target.value); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
          {["All", "Task 1", "Task 2"].map(function (o) { return <option key={o}>{o}</option>; })}
        </select>
        <select value={filterTopic} onChange={function (e) { setFilterTopic(e.target.value); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
          {["All"].concat(TOPICS).map(function (o) { return <option key={o}>{o}</option>; })}
        </select>
        <span className="ml-auto text-xs text-gray-500 self-center">{filtered.length} questions</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 && <p className="text-center py-8 text-gray-500 text-sm">No questions. Click "+ New" to add one.</p>}
        {filtered.map(function (q) {
          return (
            <div key={q.id} className="bg-gray-800 border border-gray-700 hover:border-orange-700 rounded-xl p-3 transition-all">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#431407", color: "#fdba74" }}>{q.task}</span>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{q.chartType || q.essayType}</span>
                    <span className="text-xs text-gray-500">{q.topic} · {q.difficulty}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{q.question}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={function () { var base = emptyQ(); Object.assign(base, q); if (!base.chartData) base.chartData = emptyQ().chartData; setEd(base); setView("edit"); }} className="text-xs bg-gray-700 hover:bg-orange-900 hover:text-orange-300 text-gray-300 px-2 py-1 rounded-lg transition-all">Edit</button>
                  {confirmDel === q.id ? (
                    <div className="flex gap-1">
                      <button onClick={function () { onDelete(q.id); setConfirmDel(null); }} className="text-xs bg-red-700 text-white px-2 py-1 rounded-lg">Yes</button>
                      <button onClick={function () { setConfirmDel(null); }} className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded-lg">No</button>
                    </div>
                  ) : (
                    <button onClick={function () { setConfirmDel(q.id); }} className="text-xs bg-gray-700 hover:bg-red-900 hover:text-red-300 text-gray-400 px-2 py-1 rounded-lg transition-all">Del</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QPicker(props) {
  var questions = props.questions;
  var onSelect = props.onSelect;
  var onClose = props.onClose;
  var [fTask, setFTask] = useState("All");
  var [fType, setFType] = useState("All");
  var [fTopic, setFTopic] = useState("All");
  var [fDiff, setFDiff] = useState("All");
  var [preview, setPreview] = useState(null);

  var types = fTask === "Task 1" ? CHART_TYPES : fTask === "Task 2" ? TASK2_TYPES : CHART_TYPES.concat(TASK2_TYPES);
  var filtered = questions.filter(function (q) {
    return (fTask === "All" || q.task === fTask) &&
      (fType === "All" || q.chartType === fType || q.essayType === fType) &&
      (fTopic === "All" || q.topic === fTopic) &&
      (fDiff === "All" || q.difficulty === fDiff);
  });

  if (preview) return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2 shrink-0">
        <button onClick={function () { setPreview(null); }} className="text-sm text-gray-400 hover:text-orange-400">← Back</button>
        <span className="text-sm font-bold">Preview</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#431407", color: "#fdba74" }}>{preview.task}</span>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{preview.chartType || preview.essayType}</span>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{preview.topic} · {preview.difficulty}</span>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed">{preview.question}</p>
        {preview.chartData && <ChartVisual chartType={preview.chartType} chartData={preview.chartData} />}
        {VISUAL_TYPES.indexOf(preview.chartType) < 0 && preview.task === "Task 1" && (
          <div className="mt-3 text-xs text-amber-400 bg-amber-950 border border-amber-800 rounded-lg px-3 py-2">⚠️ In the real exam a visual would appear here.</div>
        )}
      </div>
      <div className="p-4 border-t border-gray-800 shrink-0">
        <button onClick={function () { onSelect(preview); }} className="w-full py-3 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>Use This Question → Start Writing</button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2 shrink-0">
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-orange-400">← Back</button>
        <span className="text-sm font-bold flex-1">Question Bank</span>
        <span className="text-xs text-gray-500">{filtered.length} questions</span>
      </div>
      <div className="px-4 py-2 border-b border-gray-800 flex flex-wrap gap-2 shrink-0">
        <select value={fTask} onChange={function (e) { setFTask(e.target.value); setFType("All"); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
          {["All", "Task 1", "Task 2"].map(function (o) { return <option key={o}>{o}</option>; })}
        </select>
        <select value={fType} onChange={function (e) { setFType(e.target.value); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
          {["All"].concat(types).map(function (o) { return <option key={o}>{o}</option>; })}
        </select>
        <select value={fTopic} onChange={function (e) { setFTopic(e.target.value); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
          {["All"].concat(TOPICS).map(function (o) { return <option key={o}>{o}</option>; })}
        </select>
        <select value={fDiff} onChange={function (e) { setFDiff(e.target.value); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
          {["All"].concat(DIFFICULTIES).map(function (o) { return <option key={o}>{o}</option>; })}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 && <p className="text-center py-8 text-gray-500 text-sm">No questions match your filters.</p>}
        {filtered.map(function (q) {
          return (
            <button key={q.id} onClick={function () { setPreview(q); }} className="w-full text-left bg-gray-800 border border-gray-700 hover:border-orange-600 rounded-xl p-3 transition-all">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#431407", color: "#fdba74" }}>{q.task}</span>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{q.chartType || q.essayType}</span>
                    <span className="text-xs text-gray-500">{q.topic} · {q.difficulty}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{q.question}</p>
                </div>
                <span className="text-sm shrink-0" style={{ color: JAX }}>→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScoreCard(props) {
  var col = bandColor(props.score);
  return (
    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-400 font-medium leading-tight">{props.label}</span>
        <span className="text-xl font-extrabold ml-2" style={{ color: col }}>{props.score}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: ((props.score - 1) / 8 * 100) + "%", backgroundColor: col }} />
      </div>
    </div>
  );
}

function RadarPanel(props) {
  var data = criteriaKeys.map(function (c) { return { subject: c.key, score: props.scores[c.key] || 0, fullMark: 9 }; });
  return (
    <ResponsiveContainer width="100%" height={210}>
      <RadarChart data={data} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }} />
        <Radar dataKey="score" stroke={JAX} fill={JAX} fillOpacity={0.2} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default function App() {
  var [role, setRole] = useState(null);
  var [pinInput, setPinInput] = useState("");
  var [pinError, setPinError] = useState(false);
  var [step, setStep] = useState("setup");
  var [taskType, setTaskType] = useState("Task 1");
  var [chartType, setChartType] = useState("Bar Chart");
  var [subtype, setSubtype] = useState(TASK2_TYPES[0]);
  var [targetBand, setTargetBand] = useState(7);
  var [question, setQuestion] = useState("");
  var [chartData, setChartData] = useState(null);
  var [sourceMode, setSourceMode] = useState(null);
  var [answer, setAnswer] = useState("");
  var [loading, setLoading] = useState(false);
  var [loadingMsg, setLoadingMsg] = useState("");
  var [feedback, setFeedback] = useState(null);
  var [history, setHistory] = useState([]);
  var [fbTab, setFbTab] = useState("narrative");
  var [showManager, setShowManager] = useState(false);
  var [showPicker, setShowPicker] = useState(false);
  var [bank, setBank] = useState([]);
  var [bankLoaded, setBankLoaded] = useState(false);

  var isStaff = role === "teacher" || role === "admin";
  var wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  var minWords = taskType === "Task 1" ? 150 : 250;

  useEffect(function () {
    loadBank().then(function (d) { setBank(d || SEED); setBankLoaded(true); });
  }, []);

  useEffect(function () {
    if (bankLoaded) saveBank(bank);
  }, [bank, bankLoaded]);

  useEffect(function () {
    setQuestion(""); setChartData(null); setSourceMode(null);
  }, [taskType, chartType, subtype]);

  async function callAPI(prompt, maxTok) {
    var mt = maxTok || 1500;
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: mt, messages: [{ role: "user", content: prompt }] })
    });
    var data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    var raw = data.content.map(function (b) { return b.text || ""; }).join("").replace(/```json|```/g, "").trim();
    return JSON.parse(raw);
  }

  async function generate() {
    setLoading(true); setLoadingMsg("Generating question…"); setChartData(null); setQuestion("");
    try {
      var p = await callAPI(buildGenPrompt(chartType, taskType, subtype), 1800);
      setQuestion(p.question);
      if (p.chartData) setChartData(p.chartData);
    } catch (e) { setQuestion("Generation failed. Please try again."); }
    setLoading(false); setLoadingMsg("");
  }

  async function submit() {
    if (!answer.trim() || !question.trim()) return;
    setLoading(true); setLoadingMsg("AI Examiner is marking your response…"); setFeedback(null);
    try {
      var type = taskType === "Task 1" ? chartType : subtype;
      var p = await callAPI(buildFeedbackPrompt(taskType, type, question, chartData, answer, targetBand, history), 2000);
      setFeedback(p);
      setHistory(function (prev) { return prev.concat([{ TA: p.scores.TA, CC: p.scores.CC, LR: p.scores.LR, GRA: p.scores.GRA, overall: p.overall }]); });
      setStep("feedback"); setFbTab("narrative");
    } catch (e) { alert("Marking failed. Please try again."); }
    setLoading(false); setLoadingMsg("");
  }

  function selectQ(q) {
    setTaskType(q.task);
    if (q.task === "Task 1") setChartType(q.chartType || "Bar Chart");
    else setSubtype(q.essayType || TASK2_TYPES[0]);
    setQuestion(q.question); setChartData(q.chartData || null);
    setSourceMode("bank"); setShowPicker(false); setStep("write");
  }

  function saveQ(q) {
    setBank(function (prev) {
      var i = -1;
      prev.forEach(function (x, idx) { if (x.id === q.id) i = idx; });
      return i >= 0 ? prev.map(function (x) { return x.id === q.id ? q : x; }) : prev.concat([q]);
    });
  }

  function delQ(id) { setBank(function (prev) { return prev.filter(function (x) { return x.id !== id; }); }); }
  function reset() { setStep("setup"); setAnswer(""); setQuestion(""); setChartData(null); setFeedback(null); setSourceMode(null); }
  function tryAgain() { setAnswer(""); setFeedback(null); setStep("write"); }

  function Header() {
    return (
      <div className="border-b border-gray-800 px-4 py-3 flex items-center justify-between shrink-0"
        style={{ background: "linear-gradient(135deg,#0f0f1a 0%,#1a0a00 100%)" }}>
        <div className="flex items-center gap-3">
          <Logo />
          <div className="border-l border-gray-700 pl-3">
            <div className="text-xs font-bold text-white tracking-wide">IELTS Writing Tutor</div>
            <div className="text-xs" style={{ color: JAX }}>Powered by Jaxtina · AI Examiner</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isStaff && (
            <button onClick={function () { setShowManager(true); }}
              className="text-xs px-3 py-1.5 rounded-lg font-bold border border-orange-700 transition-all hover:bg-orange-950"
              style={{ color: JAX }}>⚙️ Bank</button>
          )}
          <select value={targetBand} onChange={function (e) { setTargetBand(Number(e.target.value)); }}
            className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none">
            {[5, 5.5, 6, 6.5, 7, 7.5, 8].map(function (b) { return <option key={b} value={b}>🎯 Band {b}</option>; })}
          </select>
          {step !== "setup" && <button onClick={reset} className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-1 rounded-lg hover:bg-gray-700">New</button>}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium"
            style={isStaff ? { background: "#431407", borderColor: "#7c2d12", color: "#fdba74" } : { background: "#1e3a5f", borderColor: "#1e40af", color: "#93c5fd" }}>
            {isStaff ? "👨‍🏫 Staff" : "🎓 Student"}
          </div>
        </div>
      </div>
    );
  }

  // ── Role selection ──────────────────────────────────────────────────────
  if (role === null) return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6" style={{ fontFamily: "Inter,system-ui,sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><Logo /><div className="mt-4 text-base font-bold text-white">IELTS Writing Tutor</div><div className="text-xs text-gray-400 mt-1">Please select your role to continue</div></div>
        {!pinInput ? (
          <div className="space-y-3">
            <button onClick={function () { setRole("student"); }}
              className="w-full py-4 rounded-xl border border-blue-800 bg-gray-900 hover:bg-blue-950 hover:border-blue-600 transition-all flex items-center gap-4 px-5">
              <span className="text-2xl">🎓</span>
              <div className="text-left"><div className="text-sm font-bold text-white">Student</div><div className="text-xs text-gray-400">Practice writing and receive AI feedback</div></div>
            </button>
            <button onClick={function () { setPinInput(" "); }}
              className="w-full py-4 rounded-xl border border-orange-800 bg-gray-900 hover:bg-orange-950 hover:border-orange-600 transition-all flex items-center gap-4 px-5">
              <span className="text-2xl">🔐</span>
              <div className="text-left"><div className="text-sm font-bold" style={{ color: JAX }}>Teacher / Admin</div><div className="text-xs text-gray-400">Manage questions, settings and reports</div></div>
            </button>
          </div>
        ) : (
          <div className="rounded-xl p-5 border" style={{ background: "#0f0f1a", borderColor: "#7c2d12" }}>
            <div className="text-sm font-bold mb-1" style={{ color: JAX }}>🔐 Staff Access</div>
            <div className="text-xs text-gray-400 mb-4">Enter your staff PIN to continue</div>
            <input type="password" maxLength={20} autoFocus value={pinInput.trim()}
              onChange={function (e) { setPinInput(e.target.value); setPinError(false); }}
              onKeyDown={function (e) { if (e.key === "Enter") { if (pinInput.trim() === STAFF_PIN) { setRole("teacher"); setPinInput(""); setPinError(false); } else { setPinError(true); setPinInput(" "); } } }}
              placeholder="Enter PIN…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none tracking-widest text-center text-lg mb-3" />
            {pinError && <p className="text-xs text-red-400 mb-3 text-center">Incorrect PIN. Please try again.</p>}
            <div className="flex gap-2">
              <button onClick={function () { if (pinInput.trim() === STAFF_PIN) { setRole("teacher"); setPinInput(""); setPinError(false); } else { setPinError(true); setPinInput(" "); } }}
                className="flex-1 py-2.5 text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>Confirm</button>
              <button onClick={function () { setPinInput(""); setPinError(false); }} className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg text-sm hover:bg-gray-700">Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isStaff && showManager) return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ fontFamily: "Inter,system-ui,sans-serif" }}>
      <Header />
      <QBankManager questions={bank} onSave={saveQ} onDelete={delQ} onClose={function () { setShowManager(false); }} />
    </div>
  );

  if (showPicker) return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ fontFamily: "Inter,system-ui,sans-serif" }}>
      <Header />
      <QPicker questions={bank} onSelect={selectQ} onClose={function () { setShowPicker(false); }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ fontFamily: "Inter,system-ui,sans-serif" }}>
      <Header />
      {/* Step bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex gap-1 shrink-0">
        {[["setup", "1", "Choose Task"], ["write", "2", "Write"], ["feedback", "3", "Feedback"]].map(function (arr) {
          var s = arr[0]; var n = arr[1]; var label = arr[2];
          return (
            <div key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={step === s ? { background: "#f9731622", border: "1px solid #f9731655", color: "white" } : { color: "#6b7280" }}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                style={step === s ? { background: JAX, color: "white" } : { background: "#374151", color: "#6b7280" }}>{n}</span>
              {label}
            </div>
          );
        })}
      </div>

      {/* SETUP */}
      {step === "setup" && (
        <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
          {isStaff && (
            <div className="mb-4 p-3 rounded-xl border text-xs font-medium" style={{ background: "#431407", borderColor: "#7c2d12", color: "#fdba74" }}>
              👨‍🏫 Staff Mode — manage questions via ⚙️ Bank in the top bar.
            </div>
          )}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-bold uppercase tracking-wider">Task Type</label>
            <div className="flex gap-2">
              {["Task 1", "Task 2"].map(function (t) {
                return (
                  <button key={t} onClick={function () { setTaskType(t); }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all"
                    style={taskType === t ? { background: "linear-gradient(135deg,#f97316,#ea580c)", border: "1px solid #f97316", color: "white" } : { background: "#1f2937", border: "1px solid #374151", color: "#6b7280" }}>
                    {t}
                    <div className="text-xs font-normal opacity-70 mt-0.5">{t === "Task 1" ? "Describe a visual · 150+ words" : "Write an essay · 250+ words"}</div>
                  </button>
                );
              })}
            </div>
          </div>
          {taskType === "Task 1" ? (
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-2 block font-bold uppercase tracking-wider">Chart / Diagram Type</label>
              <div className="grid grid-cols-3 gap-2">
                {CHART_TYPES.map(function (t) {
                  var icons = { "Bar Chart": "▊", "Line Graph": "📈", "Pie Chart": "◑", "Table": "⊞", "Process Diagram": "⟳", "Map Comparison": "🗺" };
                  return (
                    <button key={t} onClick={function () { setChartType(t); }}
                      className="py-3 px-2 rounded-xl text-xs border transition-all flex flex-col items-center gap-1"
                      style={chartType === t ? { background: "#431407", border: "1px solid #f97316", color: "#f97316" } : { background: "#1f2937", border: "1px solid #374151", color: "#6b7280" }}>
                      <span className="text-lg">{icons[t]}</span><span>{t}</span>
                      {VISUAL_TYPES.indexOf(t) < 0 && <span className="text-xs opacity-60">text only</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-2 block font-bold uppercase tracking-wider">Essay Type</label>
              <div className="flex flex-wrap gap-2">
                {TASK2_TYPES.map(function (t) {
                  return (
                    <button key={t} onClick={function () { setSubtype(t); }}
                      className="px-3 py-1.5 rounded-full text-xs border transition-all"
                      style={subtype === t ? { background: "#f9731633", border: "1px solid #f97316", color: "#f97316" } : { background: "#1f2937", border: "1px solid #374151", color: "#6b7280" }}>{t}</button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block font-bold uppercase tracking-wider">Choose a Question</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[["✨", "AI Generate", "Simon-style AI question", "generate"], ["📚", "Question Bank", "Pick from saved bank", "bank"], ["📋", "Paste Own", "Enter your own", "custom"]].map(function (arr) {
                var icon = arr[0]; var title = arr[1]; var desc = arr[2]; var mode = arr[3];
                return (
                  <button key={mode}
                    onClick={function () { setSourceMode(mode); if (mode === "generate") generate(); if (mode === "bank") setShowPicker(true); if (mode === "custom") { setQuestion(""); setChartData(null); } }}
                    className="py-3 px-2 rounded-xl text-xs border transition-all flex flex-col items-center gap-1 text-center"
                    style={sourceMode === mode ? { background: "#431407", border: "1px solid #f97316", color: "#f97316" } : { background: "#1f2937", border: "1px solid #374151", color: "#6b7280" }}>
                    <span className="text-xl">{icon}</span><span className="font-bold">{title}</span><span className="opacity-70 leading-tight">{desc}</span>
                  </button>
                );
              })}
            </div>
            {sourceMode === "custom" && (
              <textarea value={question} onChange={function (e) { setQuestion(e.target.value); }} rows={4}
                placeholder="Paste your IELTS question here…"
                className="w-full bg-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-500 resize-none focus:outline-none"
                style={{ border: "1px solid #f97316" }} />
            )}
            {question && sourceMode === "generate" && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 leading-relaxed">{question}</div>
            )}
            {chartData && <ChartVisual chartType={chartType} chartData={chartData} />}
          </div>
          {question && (
            <button onClick={function () { setStep("write"); }} className="w-full py-3 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>Start Writing →</button>
          )}
        </div>
      )}

      {/* WRITE */}
      {step === "write" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1 p-3 space-y-3">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#431407", color: "#fdba74" }}>{taskType}</span>
                <span className="text-xs text-gray-500">{taskType === "Task 1" ? chartType : subtype}</span>
                <span className="ml-auto text-xs text-gray-500">Min {minWords} words · Band {targetBand}</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">{question}</p>
              {chartData && <ChartVisual chartType={chartType} chartData={chartData} />}
              {VISUAL_TYPES.indexOf(chartType) < 0 && taskType === "Task 1" && (
                <div className="mt-2 text-xs text-amber-400 bg-amber-950 border border-amber-800 rounded-lg px-3 py-1.5">⚠️ In the real exam a {chartType.toLowerCase()} image would appear here.</div>
              )}
            </div>
            <textarea value={answer} onChange={function (e) { setAnswer(e.target.value); }} rows={10}
              placeholder={"Write your " + taskType + " response here… (minimum " + minWords + " words)"}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 resize-none focus:outline-none leading-relaxed"
              onFocus={function (e) { e.target.style.borderColor = JAX; }}
              onBlur={function (e) { e.target.style.borderColor = "#374151"; }} />
          </div>
          <div className="shrink-0 bg-gray-900 border-t border-gray-800 px-4 py-3 flex items-center justify-between">
            <span className={"text-xs font-bold " + (wordCount >= minWords ? "text-emerald-400" : wordCount >= minWords * 0.8 ? "text-yellow-400" : "text-gray-500")}>
              {wordCount} / {minWords} words {wordCount >= minWords ? "✓" : ""}
            </span>
            <button onClick={submit} disabled={loading || !answer.trim() || wordCount < 50}
              className="px-6 py-2.5 text-white rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: loading || !answer.trim() || wordCount < 50 ? "#374151" : "linear-gradient(135deg,#f97316,#ea580c)" }}>
              {loading ? loadingMsg : "Submit for Marking →"}
            </button>
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      {step === "feedback" && feedback && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0" style={{ background: "linear-gradient(135deg,#0f0f1a,#1a0a00)" }}>
            <div className="text-center shrink-0">
              <div className="text-3xl font-extrabold" style={{ color: bandColor(feedback.overall) }}>{feedback.overall}</div>
              <div className="text-xs text-gray-500 font-medium">Overall</div>
            </div>
            <div className="flex-1 text-xs text-gray-300 leading-relaxed italic hidden sm:block border-l border-gray-700 pl-3">"{feedback.examinerSummary}"</div>
            <button onClick={tryAgain} className="text-xs text-white px-3 py-2 rounded-lg shrink-0 font-bold hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>Try Again</button>
          </div>
          <div className="flex border-b border-gray-800 bg-gray-900 shrink-0">
            {[["narrative", "📝 Feedback"], ["scoreboard", "📊 Scores"], ["history", "📈 Progress"]].map(function (arr) {
              return (
                <button key={arr[0]} onClick={function () { setFbTab(arr[0]); }}
                  className="px-4 py-2.5 text-xs font-bold transition-all"
                  style={fbTab === arr[0] ? { borderBottom: "2px solid #f97316", color: "#f97316" } : { color: "#6b7280" }}>
                  {arr[1]}
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {fbTab === "narrative" && (
              <div className="space-y-4 max-w-2xl mx-auto">
                {feedback.dataAccuracy && (
                  <div className="bg-blue-950 border border-blue-800 rounded-xl p-3">
                    <div className="text-xs font-bold text-blue-400 mb-1">📊 Data Accuracy & Overview</div>
                    <p className="text-xs text-gray-300 leading-relaxed">{feedback.dataAccuracy}</p>
                  </div>
                )}
                <div className="bg-emerald-950 border border-emerald-800 rounded-xl p-4">
                  <div className="text-sm font-bold text-emerald-400 mb-3">✅ Strengths</div>
                  <ul className="space-y-2">
                    {feedback.strengths.map(function (s, i) {
                      return <li key={i} className="flex gap-2 text-xs text-gray-300"><span className="text-emerald-500 shrink-0 mt-0.5">•</span>{s}</li>;
                    })}
                  </ul>
                </div>
                <div className="rounded-xl p-4" style={{ background: "#1a0a00", border: "1px solid #7c2d12" }}>
                  <div className="text-sm font-bold mb-3" style={{ color: JAX }}>🔧 Areas to Improve</div>
                  <div className="space-y-4">
                    {feedback.improvements.map(function (imp, i) {
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-orange-300">{imp.issue}</span>
                            <span className="text-xs bg-orange-900 text-orange-300 px-1.5 py-0.5 rounded">{imp.criterion}</span>
                          </div>
                          <div className="bg-gray-900 rounded-lg p-2 border-l-2 border-red-500">
                            <div className="text-xs text-gray-500 mb-0.5">Original</div>
                            <div className="text-xs text-gray-300 italic">"{imp.original}"</div>
                          </div>
                          <div className="bg-gray-900 rounded-lg p-2 border-l-2 border-emerald-500">
                            <div className="text-xs text-gray-500 mb-0.5">Improved (Band {targetBand})</div>
                            <div className="text-xs text-emerald-300 italic">"{imp.improved}"</div>
                          </div>
                          <p className="text-xs text-gray-400 pl-2">{imp.explanation}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
                    <div className="text-xs font-bold mb-2" style={{ color: JAX }}>📚 Vocab Highlights</div>
                    <div className="flex flex-wrap gap-1.5">
                      {feedback.vocabHighlights.map(function (v, i) {
                        return <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#431407", color: "#fdba74" }}>{v}</span>;
                      })}
                    </div>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
                    <div className="text-xs font-bold text-purple-400 mb-2">💡 Jaxtina Tip</div>
                    <p className="text-xs text-gray-300 leading-relaxed">{feedback.examTip}</p>
                  </div>
                </div>
              </div>
            )}
            {fbTab === "scoreboard" && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <div className="text-xs font-bold text-gray-400 text-center mb-1">Criteria Radar</div>
                  <RadarPanel scores={feedback.scores} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {criteriaKeys.map(function (c) { return <ScoreCard key={c.key} label={c.label} score={feedback.scores[c.key]} />; })}
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <div className="text-xs font-bold text-gray-400 mb-3">Gap to Target Band {targetBand}</div>
                  {criteriaKeys.map(function (c) {
                    var gap = targetBand - feedback.scores[c.key];
                    var col = gap <= 0 ? "#10b981" : gap <= 1 ? "#f59e0b" : "#ef4444";
                    return (
                      <div key={c.key} className="flex items-center gap-3 mb-2">
                        <div className="text-xs text-gray-400 w-8">{c.key}</div>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div className="h-2 rounded-full transition-all duration-700" style={{ width: Math.min(100, (feedback.scores[c.key] / 9 * 100)) + "%", backgroundColor: col }} />
                        </div>
                        <div className="text-xs font-bold w-12 text-right" style={{ color: col }}>{gap <= 0 ? "✓ met" : "+" + gap.toFixed(1)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {fbTab === "history" && (
              <div className="max-w-2xl mx-auto space-y-4">
                {history.length < 2 ? (
                  <p className="text-center py-12 text-gray-500 text-sm">Submit 2+ attempts to see your progress chart.</p>
                ) : (
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="text-xs font-bold text-gray-400 mb-3">Band Score Trend</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={history.map(function (h, i) { return { attempt: "#" + (i + 1), overall: h.overall, TA: h.TA, CC: h.CC, LR: h.LR, GRA: h.GRA }; })} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                        <XAxis dataKey="attempt" tick={{ fill: "#6b7280", fontSize: 10 }} />
                        <YAxis domain={[4, 9]} tick={{ fill: "#6b7280", fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
                        <Line type="monotone" dataKey="overall" stroke={JAX} strokeWidth={2.5} dot={{ fill: JAX, r: 4 }} name="Overall" />
                        <Line type="monotone" dataKey="TA" stroke="#10b981" strokeWidth={1.5} dot={false} name="TA" />
                        <Line type="monotone" dataKey="CC" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="CC" />
                        <Line type="monotone" dataKey="LR" stroke="#ef4444" strokeWidth={1.5} dot={false} name="LR" />
                        <Line type="monotone" dataKey="GRA" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="GRA" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <div className="text-xs font-bold text-gray-400 mb-3">Attempt History</div>
                  {history.map(function (h, i) {
                    return (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-700 last:border-0 flex-wrap">
                        <span className="text-xs text-gray-500 w-16">Attempt {i + 1}</span>
                        <span className="text-sm font-extrabold" style={{ color: bandColor(h.overall) }}>{h.overall}</span>
                        <div className="flex gap-2 ml-auto flex-wrap">
                          {["TA", "CC", "LR", "GRA"].map(function (k) {
                            return <span key={k} className="text-xs text-gray-400">{k}: <span style={{ color: bandColor(h[k]) }}>{h[k]}</span></span>;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="rounded-2xl px-8 py-6 text-center border" style={{ background: "linear-gradient(135deg,#0f0f1a,#1a0a00)", borderColor: "#7c2d12" }}>
            <Logo />
            <div className="flex gap-1.5 justify-center my-4">
              {[0, 1, 2].map(function (i) { return <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: JAX, animationDelay: (i * 0.15) + "s" }} />; })}
            </div>
            <p className="text-sm text-gray-300">{loadingMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
