# Feature Pipeline (Team Workflow)

$ARGUMENTS

## Pipeline

1. **Spec** (Requirements Engineer): Create feature specification in `.features/`
2. **Architecture** (Solution Architect): Design component structure, data flow, API contracts
3. **Implementation** (Frontend + Backend in parallel): Build components and endpoints
4. **QA** (QA Engineer): Validate against acceptance criteria, run tests
5. **Deploy Check** (DevOps): Pre-deployment validation

## Execution
Run each phase sequentially. Use Agent Teams when available to parallelize Frontend + Backend.
At each phase, load the corresponding agent and execute.
