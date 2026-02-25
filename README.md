Academic Project Management

Authors: Fanomezana Sarobidy Michelle RAZAFINDRAKOTO & Elie Kokou Mokpokpo ETOVENA
Supervised by: Prof. Samir AMRI
Academic Year: 2025–2026

Table of Contents

Project Overview

System Workflow

Architecture

Features

Business Rules

Usage

Future Enhancements

Project Overview

Academic Project Management is a web-based platform designed to manage academic projects using Agile methodology.

The system enables students and professors to collaborate efficiently through sprint planning, task management, Kanban visualization, internal messaging, statistics tracking, and project evaluation.

The main objective is to provide a structured and collaborative environment that improves project organization, monitoring, and academic supervision.

System Workflow

Account Creation

Users create an account.

They must specify their role: Student or Professor.

Authentication

Users log in to access the platform.

Project Creation

A student creates a project.

Defines:

Number of sprints

Sprint duration

Collaboration

The project creator can:

Add student collaborators (optional)

Assign a supervising professor (optional)

Task Management

Create tasks

Create subtasks

Define task dependencies (a task must be completed before another starts)

Communication

Internal messaging system for project members.

Monitoring

Kanban board (To Do / In Progress / Done)

Statistics dashboard

Deliverable submission

Professor evaluation and grading

Architecture

The application follows a classic 3-tier architecture:

Presentation Layer
User interface for authentication, project management, Kanban board, messaging, and statistics.

Business Logic Layer
Handles project lifecycle, sprint configuration, task dependencies, role permissions, and evaluation logic.

Data Layer
Stores users, projects, sprints, tasks, subtasks, messages, deliverables, and grades.

Features

Role-based registration (Student / Professor)

Agile-based project structure (Sprints & duration management)

Task & subtask management

Task dependency control

Kanban board visualization

Internal messaging system

Statistics dashboard:

Number of projects

Tasks completed

Tasks in progress

Tasks pending

Deliverable submission

Professor grading system

Business Rules

The following business rules govern the system:

Role Definition

Each user must select a role at registration.

A user cannot have both roles simultaneously.

Project Ownership

Only students can create projects.

The project creator becomes the project owner.

Sprint Configuration

A project must define:

At least one sprint

A sprint duration

Collaboration

Collaborators must be registered students.

A supervising professor is optional.

Only members of the same project can access its data.

Task Management

Tasks belong to a specific project.

Subtasks belong to a parent task.

A task cannot be marked as completed if:

Its subtasks are not completed.

Its dependent tasks are not completed.

Kanban Rules

Tasks move through predefined states:

To Do

In Progress

Done

Messaging

Only project members (students and assigned professor) can send and receive messages.

Deliverables

Only students can submit deliverables.

Only the supervising professor can evaluate and assign grades.

Statistics

Statistics are automatically calculated based on task states and project data.

Usage

Register and select your role.

Log in to the platform.

Create a new project and define sprint parameters.

Add collaborators and/or assign a professor.

Create tasks and subtasks.

Track progress using the Kanban board.

Communicate via internal messaging.

Submit deliverables.

Receive evaluation and grading from the professor.

Future Enhancements

Real-time notifications

Advanced analytics and performance indicators

File version control for deliverables

Integration with university information systems

Mobile-friendly interface
