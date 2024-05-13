import React from 'react';
import TEST_ID from './Tasks.testid.js';
import TaskList from '../../components/TaskList/TaskList';

const Tasks = () => {
  return (
    <div data-testid={TEST_ID.container} className="bg-blue-200">
      <TaskList />
    </div>
  );
};

export default Tasks;
