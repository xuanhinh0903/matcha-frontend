# Contributing to Matcha Mobile App

📚 **Documentation Links:**

- [Main Documentation (README)](./README.md) - Project overview and setup
- [Development Guide](./DEVELOPMENT.md) - Technical guides for features and pages

## Development Workflow

### 1. Setup

- Ensure your development environment meets all prerequisites in [README.md](./README.md)
- Configure your editor with the project's ESLint and Prettier settings
- Install recommended VS Code extensions
- Set up git hooks: `pnpm prepare`

### 2. Branch Strategy

```
main
├── development
│   ├── feature/user-profile
│   ├── feature/chat-system
│   └── fix/login-issue
└── staging
```

- `main`: Production code
- `development`: Main development branch
- `staging`: Pre-production testing
- Feature branches branch off and merge back into `development`

### 3. Branch Naming

- Features: `feature/descriptive-name`
- Bugs: `fix/issue-description`
- Hotfixes: `hotfix/critical-issue`
- Refactoring: `refactor/component-name`

### 4. Commit Standards

We follow [Conventional Commits](https://www.conventionalcommits.org/). Each commit message should have a structured format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

Examples:

```
feat(auth): add biometric login
fix(messaging): resolve message duplication
docs(readme): update installation steps
```

### 5. Code Style

#### TypeScript

- Use TypeScript for all new code
- Define interfaces for all props and state
- Use strict type checking
- Avoid `any` type

```typescript
// Good
interface UserProps {
  id: string;
  name: string;
  age: number;
}

// Bad
const user: any = {
  /* ... */
};
```

#### React/React Native

- Use functional components with hooks
- Implement proper error boundaries
- Use memo/useMemo/useCallback appropriately
- Keep components focused and small

```typescript
// Good
const UserCard: React.FC<UserProps> = ({ name, age }) => {
  const formattedName = useMemo(() => formatName(name), [name]);

  return (
    <Card>
      <Text>{formattedName}</Text>
      <Text>{age}</Text>
    </Card>
  );
};

// Bad
const UserCard = (props) => { /* ... */ };
```

#### State Management

- Use RTK Query for API interactions
- Use Redux for global app state
- Use local state for component-specific state
- Use Jotai for atomic state management when appropriate

For detailed implementation examples, see the [Development Guide](./DEVELOPMENT.md).

### 6. Testing

- Write tests for all new features
- Maintain existing test coverage
- Follow testing patterns in `__tests__` directories

```typescript
describe('UserCard', () => {
  it('should render user information correctly', () => {
    const { getByText } = render(<UserCard name="John" age={25} />);
    expect(getByText('John')).toBeTruthy();
    expect(getByText('25')).toBeTruthy();
  });
});
```

### 7. Performance

- Use React Native performance monitoring tools
- Implement proper list virtualization
- Optimize images and assets
- Profile app regularly

### 8. Pull Request Process

1. Update your branch with latest changes:

```bash
git checkout development
git pull origin development
git checkout your-branch
git rebase development
```

2. Run all checks locally:

```bash
pnpm check-all
```

3. Create a pull request with:

   - Clear title following commit conventions
   - Detailed description of changes
   - Screenshots/videos for UI changes
   - Links to related issues
   - List of testing steps

4. Request reviews from relevant team members

5. Address review feedback

6. Ensure CI checks pass

7. Squash and merge after approval

### 9. Code Review Guidelines

#### As a PR Author

- Keep PRs focused and reasonable in size
- Provide context and rationale for changes
- Respond to comments promptly
- Be open to feedback

#### As a Reviewer

- Review code within 24 hours
- Be constructive and respectful
- Look for:
  - Functionality
  - Code style
  - Performance implications
  - Security concerns
  - Test coverage
  - Documentation

### 10. Documentation

- Update [README.md](./README.md) for significant changes
- Document new features in-code
- Update API documentation
- Add comments for complex logic

### 11. Debugging

- Use React Native Debugger
- Implement proper error logging
- Use performance monitoring tools
- Document common issues and solutions

### 12. Security

- Never commit sensitive data
- Follow security best practices
- Review dependencies regularly
- Report security issues immediately

### 13. Release Process

1. Create release branch
2. Update version numbers
3. Generate changelog
4. Build release candidates
5. Perform testing
6. Create release tag
7. Deploy to stores

## Questions?

- Check [README.md](./README.md) for setup and basic information
- Refer to [Development Guide](./DEVELOPMENT.md) for technical details
- Ask in team Slack channel
- Contact team lead
- Create a discussion in GitHub
