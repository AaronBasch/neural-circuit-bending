//Set up NPM on M1 mac:
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"  # This loads nvm
[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion
source ~/.zshrc

//Activate venv:
cd flask-server
source venv/bin/activate

To run app, make sure DDSP is installed (https://github.com/magenta/ddsp)
cd into flask-server and run 'python server.py'
In a separate terminal, cd into react-front-end, then run 'npm start'.

![alt text](https://github.com/AaronBasch/neural-circuit-bending/read-me/appPreview.png)
