yarn install 报错:
```bash
00h00m00s 0/0: : ERROR: [Errno 2] No such file or directory: 'install'
q@Q-PC:~/running_page$ sudo apt remove cmdtest
```

- [解决参考](https://stackoverflow.com/questions/46013544/yarn-install-command-error-no-such-file-or-directory-install)
- [解决参考](https://blog.csdn.net/qq_43193386/article/details/112303352)
- [解决参考](https://www.zsxcool.com/8109.html)


yarn install 报错:

```bash
yarn install v1.22.19
[1/5] Validating package.json...
error yihong.run@1.0.0: The engine "node" is incompatible with this module. Expected version ">=14.15.0". Got "8.10.0"
error Found incompatible module.
info Visit https://yarnpkg.com/en/docs/cli/install for documentation about this command.
```

- [参考解决](https://www.codegrepper.com/code-examples/javascript/The+engine+%22node%22+is+incompatible+with+this+module.+Expected+version+%22%5E14%22.+Got+%2215.4.0%22)


 yarn install --ignore-engines

 sudo npm install -g yarn


---------




# step 1
pip3 install -r requirements.txt


# step 2


- [下载脚本，后缀改为 `.sh`](https://deb.nodesource.com/setup_14.x)

运行脚本 


报错:

```bash
 The following signatures couldn't be verified because the public key is not available: NO_PUBKEY 4EB27DB2A3B88B8B
```
- [解决参考](https://itsfoss.com/solve-gpg-error-signatures-verified-ubuntu/)

Now add this public key to your Ubuntu system using the apt-key command:

`sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 68980A0EA10B4DE8`
If you see a warning message about apt-key command being deprecated, please ignore it.

The above command will add the key to the system. Just do an `sudo apt-get update` and you should not see this error anymore.



## Run `sudo apt-get install -y nodejs` to install Node.js 14.x and npm
## You may also need development tools to build native addons:
     sudo apt-get install gcc g++ make
## To install the Yarn package manager, run:
     curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null
     echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
     sudo apt-get update && sudo apt-get install yarn





# step 3
yarn install
# step 4
yarn develop


 ERROR 
```bash
ENOSPC: System limit for number of file watchers reached, watch
```

- [解决参考](https://stackoverflow.com/questions/55763428/react-native-error-enospc-system-limit-for-number-of-file-watchers-reached)





捕获数据：

拉取数据的时候需要把 *** 关了再拉取 --is-cn


python3 scripts/garmin_sync.py count password --is-cn

python3 scripts/gen_svg.py --from-db --title "路古" --type github --athlete "慢即是快" --special-distance 5 --special-distance2 10 --special-color yellow --special-color2 red --output assets/github.svg --use-localtime --min-distance 0.5

python3 scripts/gen_svg.py --from-db --title "路古_GRID" --type grid --athlete "慢即是快"  --output assets/grid.svg --min-distance 5.0 --special-color yellow --special-color2 red --special-distance 10 --special-distance2 20 --use-localtime


python3 scripts/gen_svg.py --from-db --type circular --use-localtime


---------------------

20230427


先安装 node : https://blog.csdn.net/moxiaomomo/article/details/103271478
https://www.cnblogs.com/forheart/p/13203249.html


安装 14.X

 curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
 sudo apt-get install -y nodejs  --fix-missing


- 科学与不科学交替
- 网不好的时候就换个时间段整
- 关闭 conda 环境


报错：

ERROR: pip's dependency resolver does not currently take into account all the packages that are installed. This behaviour is the source of the following dependency conflicts.
spyder 5.3.3 requires pyqt5<5.16, which is not installed.
spyder 5.3.3 requires pyqtwebengine<5.16, which is not installed.

显然是依赖包的依赖没安装

sudo python3 -m pip install pyqt5==5.12 pyqtchart==5.12
pip install PyQtWebEngine==5.12


https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04




 yarn install --ignore-engines


yarn develop

报错：

```

 ERROR 

ENOSPC: System limit for number of file watchers reached, watch '/home/q/Documents/running_page'
  Error: ENOSPC: System limit for number of file watchers reached, watch '/home/q/Documents/running_page'
```

这个错误是由于操作系统达到了其能够监视的文件数量的限制。在 Linux 系统中，有一个限制决定了你可以同时监视的文件数量。当你使用某些工具（如 Webpack，Nodemon 等）或某些文本编辑器时，可能会达到这个限制，因为这些工具需要监视文件的更改。

要解决这个问题，你可以增加系统的文件监视器的数量。在大多数 Linux 系统上，你可以使用以下命令来增加这个限制：

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
这个命令做了两件事：

- echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf：这将 fs.inotify.max_user_watches=524288 追加到 /etc/sysctl.conf 文件中。这个文件包含了用于调整操作系统内核参数的设置。

- sudo sysctl -p：这将使新的设置立即生效。

注意，这将把最大用户监视数量设置为 524288。这个值可能需要根据你的系统和需求进行调整。增加这个值可能会增加系统的内存使用量，因此如果你的系统内存有限，可能需要选择一个较小的值。