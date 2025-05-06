const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

function executeCommand(command, password, callback) {
    const process = spawn('sudo', ['-S', ...command.split(' ')]);
    let stdout = '';
    let stderr = '';
    process.stdout.on('data', (data) => {
        stdout += data;
    });
    process.stderr.on('data', (data) => {
        stderr += data;
    });
    process.on('close', (code) => {
        if (callback) {
            callback(code, stdout, stderr);
        }
    });
    process.stdin.write(password + '\n');
    process.stdin.end();
    return process;
}

function archiveLogs(password, callback) {
    const logsDir = './.logs';
    const archiveDir = path.join(logsDir, 'archived-logs');
    fs.mkdir(archiveDir, { recursive: true }, (err) => {
        if (err) {
            console.error('Error creating archive directory:', err);
            if (callback) { callback(1, "", "Error creating archive directory"); }
            return;
        }
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const filesToArchive = ['service_error.log', 'service.log'];
        let archiveCount = 0;
        let archiveErrors = [];
        filesToArchive.forEach((filename) => {
            const sourcePath = path.join(logsDir, filename);
            const destPath = path.join(archiveDir, `${filename}_${timestamp}`);
            fs.rename(sourcePath, destPath, (err) => {
                archiveCount++;
                if (err) {
                    archiveErrors.push(`Error moving ${filename}: ${err.message}`);
                    console.error(`Error moving ${filename}:`, err);
                }
                if (archiveCount === filesToArchive.length) {
                    if (archiveErrors.length > 0) {
                        if (callback) { callback(1, "", archiveErrors.join('\n')); }
                    } else {
                        restartService(password, callback);
                    }
                }
            });
        });
    });
}

function restartService(password, callback) {
    executeCommand('systemctl restart KindBot.service', password, (code, stdout, stderr) => {
        if (code === 0) {
            console.log('KindBot service restarted successfully.');
            if (callback) { callback(0, stdout, stderr); }
        } else {
            console.error('Error restarting KindBot service:', stderr);
            if (callback) { callback(1, stdout, stderr); }
        }
    });
}

function promptForPassword(callback) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });
    rl.question('Enter sudo password: ', (password) => {
        rl.close();
        callback(password);
    });
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
        if (stringToWrite.indexOf(this.password) === -1) {
            process.stdout.write(stringToWrite);
        } else {
            process.stdout.write('');
        }
    };
    rl.password = true;
}

promptForPassword((password) => {
    archiveLogs(password, (code, stdout, stderr) => {
        if (code === 0) {
            console.log("Archive and restart completed successfully");
        } else {
            console.error("Errors occurred during archive or restart: \n" + stderr);
        }
    });
});