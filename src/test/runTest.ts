import * as path from 'path';
import * as glob from 'glob';
import { spawn } from 'child_process';

export async function run(): Promise<void> {
	// Find test files
	const testsRoot = path.resolve(__dirname, '..');

	// Use a more specific pattern to match only compiled test files
	const testFiles = glob.sync('**/**.test.js', { cwd: testsRoot });

	if (testFiles.length === 0) {
		console.log('No test files found');
		return;
	}

	console.log(`Found ${testFiles.length} test files`);

	// Run tests using mocha
	const testFilesPaths = testFiles.map(file => path.resolve(testsRoot, file));
	
	const args = [
		...testFilesPaths,
		'--timeout', '5000',
		'--colors'
	];

	const mochaPath = path.resolve(__dirname, '..', '..', 'node_modules', '.bin', 'mocha');
	
	console.log('Running tests with Mocha...');
	const childProcess = spawn(mochaPath, args, { stdio: 'inherit' });

	await new Promise<void>((resolve, reject) => {
		childProcess.on('close', (code) => {
			if (code !== 0) {
				console.error(`Tests failed with exit code ${code}`);
				reject(new Error(`Tests failed with exit code ${code}`));
			} else {
				console.log('\n🎉 All tests passed!');
				resolve();
			}
		});

		childProcess.on('error', (err) => {
			console.error('Failed to run tests:', err);
			reject(err);
		});
	});
}