
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import "./App.css";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("Food");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const titleRef = useRef(null);

  useEffect(() => {
    async function loadExpenses() {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/posts?_limit=5"
        );
        const data = await response.json();

        const demoExpenses = data.map((item, index) => ({
          id: `demo-${item.id}`,
          title: ["Groceries", "Transport", "College supplies", "Snacks", "Shopping"][index],
          amount: [450, 120, 300, 80, 650][index],
          type: "Expense",
          category: ["Food", "Travel", "Education", "Food", "Shopping"][index],
        }));

        setExpenses(demoExpenses);
      } catch (error) {
        console.error("Could not load demo expenses:", error);
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, []);

  const totals = useMemo(() => {
    const income = expenses
      .filter((item) => item.type === "Income")
      .reduce((sum, item) => sum + item.amount, 0);

    const spent = expenses
      .filter((item) => item.type === "Expense")
      .reduce((sum, item) => sum + item.amount, 0);

    return { income, spent, balance: income - spent };
  }, [expenses]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!title.trim() || !amount || Number(amount) <= 0) {
        alert("Please enter a title and a valid amount.");
        return;
      }

      if (editingId !== null) {
        setExpenses((current) =>
          current.map((item) =>
            item.id === editingId
              ? { ...item, title: title.trim(), amount: Number(amount), type, category }
              : item
          )
        );
        setEditingId(null);
      } else {
        const newExpense = {
          id: `${Date.now()}`,
          title: title.trim(),
          amount: Number(amount),
          type,
          category,
        };
        setExpenses((current) => [newExpense, ...current]);
      }

      setTitle("");
      setAmount("");
      setType("Expense");
      setCategory("Food");
      titleRef.current?.focus();
    },
    [title, amount, type, category, editingId]
  );

  const deleteExpense = useCallback((id) => {
    setExpenses((current) => current.filter((item) => item.id !== id));
  }, []);

  const editExpense = useCallback((item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setAmount(String(item.amount));
    setType(item.type);
    setCategory(item.category);
    titleRef.current?.focus();
  }, []);

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setAmount("");
    setType("Expense");
    setCategory("Food");
  };

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <div>
            <h1>Nabiha Finance</h1>
<p>YOUR PERSONAL FINANCE TRACKER</p>
          </div>
        </div>
        <span className="live-badge">● Your finances, simplified</span>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">YOUR MONEY, YOUR CONTROL</p>
          <h2>Make every rupee <span>count.</span></h2>
          <p className="subtitle">Keep track of what comes in and what goes out.</p>
        </div>
        <div className="date-card">
          <span>✦</span>
          <div>
            <strong>Smart spending</strong>
            <p>One step at a time.</p>
          </div>
        </div>
      </section>

      <section className="summary-grid">
        <article className="summary-card balance-card">
          <div className="card-heading"><span>Available balance</span><span>◈</span></div>
          <h3>₹{totals.balance.toLocaleString("en-IN")}</h3>
          <p>Income minus expenses</p>
          <div className="card-decoration">₹</div>
        </article>

        <article className="summary-card">
          <div className="card-heading"><span>Total income</span><span className="icon-circle income-icon">↗</span></div>
          <h3>₹{totals.income.toLocaleString("en-IN")}</h3>
          <p className="positive">Money received</p>
        </article>

        <article className="summary-card">
          <div className="card-heading"><span>Total expenses</span><span className="icon-circle expense-icon">↘</span></div>
          <h3>₹{totals.spent.toLocaleString("en-IN")}</h3>
          <p>Money spent</p>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel form-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">TRANSACTION DETAILS</p>
              <h3>{editingId !== null ? "Edit transaction" : "Add a transaction"}</h3>
            </div>
            <span className="panel-symbol">＋</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Transaction name</label>
            <input
              id="title"
              ref={titleRef}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Lunch, salary..."
              required
            />

            <label htmlFor="amount">Amount (₹)</label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              required
            />

            <label htmlFor="type">Transaction type</label>
            <select id="type" value={type} onChange={(event) => setType(event.target.value)}>
              <option>Expense</option>
              <option>Income</option>
            </select>

            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>Food</option>
              <option>Travel</option>
              <option>Education</option>
              <option>Shopping</option>
              <option>Bills</option>
              <option>Salary</option>
              <option>Other</option>
            </select>

            <button className="primary-button" type="submit">
              {editingId !== null ? "Save changes" : "+ Add transaction"}
            </button>
            {editingId !== null && (
              <button className="secondary-button" type="button" onClick={cancelEdit}>
                Cancel editing
              </button>
            )}
          </form>
        </article>

        <article className="panel transactions-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">YOUR MONEY ACTIVITY</p>
              <h3>Recent transactions</h3>
            </div>
            <span className="count-badge">{expenses.length} total</span>
          </div>

          {loading ? (
            <p className="empty-state">Loading sample transactions...</p>
          ) : expenses.length === 0 ? (
            <p className="empty-state">No transactions yet. Add your first one!</p>
          ) : (
            <div className="transaction-list">
              {expenses.map((item) => (
                <div className="transaction-row" key={item.id}>
                  <div className="transaction-icon">
                    {item.type === "Income" ? "↗" : "↘"}
                  </div>
                  <div className="transaction-info">
                    <strong>{item.title}</strong>
                    <span>{item.category} · {item.type}</span>
                  </div>
                  <div className="transaction-actions">
                    <strong className={item.type === "Income" ? "amount-income" : ""}>
                      {item.type === "Income" ? "+" : "−"}₹{item.amount.toLocaleString("en-IN")}
                    </strong>
                    <div>
                      <button className="text-button" onClick={() => editExpense(item)} type="button">Edit</button>
                      <button className="text-button delete-button" onClick={() => deleteExpense(item.id)} type="button">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="footnote">Sample transactions load from a mock API. Your changes are kept in this page's current session.</p>
        </article>
      </section>

      <footer>Made with care · Pennywise Expense Tracker</footer>
    </main>
  );
}

export default App;
