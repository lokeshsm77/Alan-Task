intent('what do I do here', p => {
    p.play('This is a simple task application, which allows you add your task, and track your task');
});

intent('what are taks for today', 'today\'s tasks', p => {
    p.play('There are 12 tasks for you today, do you what to read all of them')
});

intent("Open Today's Task", "Open Today", "Show Today's Tasks", "Select Today", p =>{
    p.play({command:"Open Today", item: "Tab Today"})
});

intent("Open Backlog Task", "Open Backlog", "Show Backlog Tasks", "Select Backlog", p =>{
    p.play({command:"Open Backlog", item: "Tab Backlog"})
});

intent("Open Done Task", "Open Done", "Show Done Tasks", "Select Done", p =>{
    p.play({command:"Open Done", item: "Tab Done"})
});

intent("Add new task", p =>{
    p.play({command: 'addNewTask', item: 'addTask'});
    p.play("Opening Add new task window");
});
