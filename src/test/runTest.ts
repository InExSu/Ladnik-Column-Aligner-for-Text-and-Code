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

	let failures = 0;

	for (const file of testFiles) {
		const filePath = path.resolve(testsRoot, file);
		console.log(`\n--- Running test file: ${file} ---`);
		
		const childProcess = spawn('node', [filePath], { stdio: 'inherit' });
		
		await new Promise<void>((resolve, reject) => {
			childProcess.on('close', (code) => {
				if (code !== 0) {
					failures++;
					console.error(`Test file ${file} failed with exit code ${code}`);
					reject(new Error(`Test file ${file} failed`));
				} else {
					console.log(`✓ Test file ${file} passed`);
					resolve();
				}
			});
			
			childProcess.on('error', (err) => {
				console.error(`Failed to run test file ${file}:`, err);
				reject(err);
			});
		});
	}

	if (failures > 0) {
		throw new Error(`${failures} test(s) failed.`);
	} else {
		console.log('\n🎉 All tests passed!');
	}
}