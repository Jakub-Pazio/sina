import automergeLogo from '/automerge.png';
import '@picocss/pico/css/pico.min.css';
import './App.css';
import { useDocument } from '@automerge/automerge-repo-react-hooks';
import { updateText } from '@automerge/automerge/next';
import type { AutomergeUrl } from '@automerge/automerge-repo';
import { useState } from 'react';


export interface Task {
  id: string;
  author: string;
  title: string;
  state: State;
  stars: number;
  removed: boolean;
}

export interface TaskList {
  tasks: Task[];
}

enum State {
  BackLog = "Backlog",
  InProgress = "In Progress",
  Done = "Done!",
}

function App({ docUrl }: { docUrl: AutomergeUrl }) {
  const [doc, changeDoc] = useDocument<TaskList>(docUrl);
  const [author, setAuthor] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedStars, setSelectedStars] = useState<number>(1)

  const changeTaskState = (taskId: string, newState: State) => {
    changeDoc(d => {
      const task = d.tasks.find(t => t.id === taskId);
      if (task) task.state = newState;
    });
  };

  const removeTask = (taskId: string) => {
    changeDoc(d => {
      const task = d.tasks.find(t => t.id === taskId);
      if (task) task.removed = true
    });
  };


  const tasksByState = (state: State) =>
    doc?.tasks?.filter(task => task.state === state) || [];

  const generateId = () => Math.random().toString(36).substr(2, 9);

  return (
    <>
      <header>
        <h1>Off Team Application</h1>
      </header>

      <div className="task-creation-form">
        <div>
          <label htmlFor="author">Name:</label>
          <input
            id="author"
            type="text"
            placeholder="Enter your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="taskTitle">Task Title:</label>
          <input
            id="taskTitle"
            type="text"
            placeholder="Enter task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
        </div>

        <div>
          <label>Choose Stars (1 to 3):</label>
          <div className="stars">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                onClick={() => setSelectedStars(star)}
                style={{
                  fontSize: '2rem',
                  cursor: 'pointer',
                  color: selectedStars >= star ? 'yellow' : 'gray',
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <button type="button" onClick={() => {
          if (author.trim() && taskTitle.trim()) {
            changeDoc(d =>
              d.tasks.unshift({
                id: generateId(),
                author,
                title: taskTitle,
                state: State.BackLog,
                stars: selectedStars, // Save selected stars at creation
                removed: false,
              })
            );
            setTaskTitle(''); // Reset task title after task creation
            setSelectedStars(1); // Reset stars selection after task creation
          } else {
            alert('Please fill in both the name and task title.');
          }
        }}>
          <b>+</b> New task
        </button>
      </div>

      <div className="task-columns">
        {Object.values(State).map(state => (
          <div className="task-column" key={state}>
            <h2>{state}</h2>
            {tasksByState(state)
            .filter(task => !task.removed)
            .map(({ id, author, title, stars }) => (
              <div className="task" key={id}>
                <button
                  type="button"
                  className='close-button'
                  onClick={() => removeTask(id)}
                >
                  ❌
                </button>
                <p>{author + "'s task"}</p>
                <div className="task-buttons">
                  {state !== State.BackLog && (
                    <button style={{ color: "red" }} onClick={() => changeTaskState(id, State.BackLog)}>Backlog</button>
                  )}
                  {state !== State.InProgress && (
                    <button style={{ color: "blue" }} onClick={() => changeTaskState(id, State.InProgress)}>In Progress</button>
                  )}
                  {state !== State.Done && (
                    <button style={{ color: "green" }} onClick={() => changeTaskState(id, State.Done)}>Done</button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="What needs doing?"
                  value={title || ''}
                  onChange={(e) => changeDoc(d => {
                    const task = d.tasks.find(t => t.id === id);
                    if (task) updateText(task, ['title'], e.target.value);
                  })}
                  style={{ textDecoration: state === State.Done ? 'line-through' : 'none' }}
                />
                <p>
                  Stars:{" "}
                  {"".padStart(stars, "⭐")}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>


      <footer>
        <p className="read-the-docs">SINA 2024/2025 & Automerge library</p>
      </footer>
    </>
  );
}

export default App;
