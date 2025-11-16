import jwt from 'jsonwebtoken';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const secret = process.env.PHILOGIC_AI_JWT_SECRET;
if (!secret) {
  console.error('PHILOGIC_AI_JWT_SECRET not set');
  process.exit(1);
}

const user = args.user;
if (!user) {
  console.error('Missing --user');
  process.exit(1);
}
const expiresIn = args.expiresIn || '7d';
let claims = {};
if (args.claims) {
  try { claims = JSON.parse(args.claims); } catch (e) {
    console.error('Invalid --claims (must be JSON)');
    process.exit(1);
  }
}

const token = jwt.sign({ user, ...claims }, secret, { algorithm: 'HS256', expiresIn });
process.stdout.write(token + '\n');
