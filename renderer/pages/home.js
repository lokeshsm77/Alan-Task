"use strict";

// Packages
import { Component } from "react";
import { arrayMove } from "react-sortable-hoc";

// Layouts
import Page from "./../layouts/page";

// Components
import Row from "./../ui/row";
import Hero from "./../components/hero";
import ButtonLink from "./../ui/button-link";
import Navigation from "./../components/navigation";
import Content from "./../components/content";
import Today from "./../components/home/today";
import Backlog from "./../components/home/backlog";
import Done from "./../components/home/done";

// Services
import { getUser, updateUser } from "./../services/local-storage";

import alanBtn from "@alan-ai/alan-sdk-web";

class Home extends Component {
  constructor() {
    super();

    this.selectTab = this.selectTab.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onSortEnd = this.onSortEnd.bind(this);

    this.state = {
      user: {},
      tabSelected: "Today",
    };

    this.alanBtnInstance = null;
  }

  componentDidMount() {
    const {
      url: {
        query: { tab },
      },
    } = this.props;
    const { user } = getUser();
    const tabSelected = tab ? tab : "Today";

    this.setState({
      user,
      tabSelected,
    });
    /** Alan Integration Start */
    var _self = this;
    this.alanBtnInstance = alanBtn({
      key:
        "decf04a60f5a13700799a571520370fa2e956eca572e1d8b807a3e2338fdd0dc/stage",
      onCommand: function(commandData) {
        if (commandData != undefined) {
          let commandTxt = commandData.command;
          let selectTab = "";
          switch (commandTxt) {
            case "Open Today":
              selectTab = "Today";
              break;
            case "Open Backlog":
              selectTab = "Backlog";
              break;
            case "Open Done":
              selectTab = "Done";
              break;
          }
          const { tabSelected } = _self.state;
          if (tabSelected === selectTab) {
            _self.alanBtnInstance.playText("You are already in the same tab");
          } else {
            if (selectTab != "") {
              _self.selectTab(selectTab);
              selectTab = selectTab === "Today" ? selectTab + "'s" : selectTab;
              /* _self.alanBtnInstance.playText(
                "Navigating to, " + selectTab + " tasks"
              );*/
              _self.checkForTasks(selectTab);
            }
          }
        }
      },
    });
    /** Alan Integration End */
  }

  checkForTasks(tabSelected) {
    const { user } = this.state;
    const tasks = user.tasks;
    const filteredTasks = tasks
      ? tasks.filter((task) => task.type === tabSelected.toLowerCase())
      : [];

    if (filteredTasks.length === 0) {
      this.alanBtnInstance.playText("You do not have any tasks");
    } else {
      let taskLabel = filteredTasks.length > 1 ? " Tasks" : "Task";
      this.alanBtnInstance.playText(
        "There are " + filteredTasks.length + taskLabel
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.url.query.tab !== this.props.url.query) {
      this.selectTab(nextProps.url.query.tab);
    }
  }

  selectTab(tabSelected) {
    this.setState({ tabSelected });
  }

  onDelete(task) {
    const { user } = getUser();

    user.tasks = user.tasks.filter(({ id }) => id !== task.id);
    updateUser(user);
    this.setState({ user });
  }

  onMove(type, task) {
    const { user } = getUser();

    if (type === "backlog") {
      const taskUpdated = user.tasks.map((t) => {
        if (t.id === task.id) {
          t.type = "today";
          return t;
        }

        return t;
      });

      user.tasks = taskUpdated;
      updateUser(user);
      return this.setState({ user });
    }

    if (type === "today") {
      const taskUpdated = user.tasks.map((t) => {
        if (t.id === task.id) {
          t.type = "done";
          return t;
        }

        return t;
      });

      user.tasks = taskUpdated;
      updateUser(user);
      return this.setState({ user });
    }

    if (type === "back") {
      const taskUpdated = user.tasks.map((t) => {
        if (t.id === task.id) {
          t.type = "backlog";
          return t;
        }

        return t;
      });

      user.tasks = taskUpdated;
      updateUser(user);
      return this.setState({ user });
    }
  }

  onSortEnd({ oldIndex, newIndex }) {
    const userObj = getUser();
    const { tabSelected, user } = this.state;
    const tasks = user.tasks;
    const filteredTasks = tasks.filter(
      (task) => task.type === tabSelected.toLowerCase()
    );
    const reordered = arrayMove(filteredTasks, oldIndex, newIndex);
    const tasksRemoved = tasks.filter(
      (task) => task.type !== tabSelected.toLowerCase()
    );
    const taskUpdated = tasksRemoved.concat(reordered);

    userObj.tasks = taskUpdated;
    updateUser(userObj);
    return this.setState({ user: userObj });
  }

  render() {
    let content;
    const { tabSelected, user } = this.state;
    const tasks = user.tasks;
    const list = [
      { name: "Today", href: "/home?tab=Today" },
      { name: "Backlog", href: "/home?tab=Backlog" },
      { name: "Done", href: "/home?tab=Done" },
    ];

    switch (tabSelected) {
      case "Today":
        const todayTasks = tasks
          ? tasks.filter(({ type }) => type === "today")
          : [];
        content = (
          <Today
            tasks={todayTasks}
            onSortEnd={this.onSortEnd}
            onDelete={this.onDelete}
            onMove={(type, task) => this.onMove(type, task)}
          />
        );
        break;

      case "Backlog":
        const backlogTasks = tasks
          ? tasks.filter(({ type }) => type === "backlog")
          : [];
        content = (
          <Backlog
            tasks={backlogTasks}
            onSortEnd={this.onSortEnd}
            onDelete={this.onDelete}
            onMove={(type, task) => this.onMove(type, task)}
          />
        );
        break;

      case "Done":
        const doneTasks = tasks
          ? tasks.filter(({ type }) => type === "done")
          : [];
        content = (
          <Done
            tasks={doneTasks}
            onSortEnd={this.onSortEnd}
            onDelete={this.onDelete}
            onMove={(type, task) => this.onMove(type, task)}
          />
        );
        break;
    }

    return (
      <Page>
        <Row>
          <section>
            <Hero type={tabSelected} />

            <Navigation list={list} tabSelected={tabSelected} />

            <Content>{content}</Content>

            <ButtonLink href="/add">Add new task</ButtonLink>
            <div>
              <img src="" className="Alan-logo" alt="logo" />
            </div>
          </section>
        </Row>

        <style jsx>{`
          section {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 580px;
            padding-bottom: 30px;
          }
        `}</style>
      </Page>
    );
  }
}

export default Home;
