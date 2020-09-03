#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const ejs = require('ejs');
const stat = fs.stat;

const copy = (src, dst) => {
    //读取目录
    try {
        const paths = fs.readdirSync(src);
        paths.forEach((path) => {
            var _src = src + '/' + path;
            var _dst = dst + '/' + path;
            var readable;
            var writable;
            stat(_src, (err, st) => {
                if (err) {
                    throw err;
                }

                if (st.isFile()) {
                    readable = fs.createReadStream(_src);//创建读取流
                    writable = fs.createWriteStream(_dst);//创建写入流
                    readable.pipe(writable);
                } else if (st.isDirectory()) {
                    exists(_src, _dst, copy);
                }
            });
        });
    } catch (err) {
        throw err;
    }
};
const exists = (src, dst, callback) => {
    //测试某个路径下文件是否存在
    if (fs.existsSync(dst)) {//不存在
        callback(src, dst);
    } else {//存在
        fs.mkdir(dst, () => {//创建目录
            callback(src, dst)
        })
    }
};

const delDir = (path) => {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        // fs.rmdirSync(path);
    }
};

const streamPromise = (file, targer, template) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('file 不能为空')
        }
        setTimeout(() => {
            var readable = fs.createReadStream(path.join(template, file));
            var writable = fs.createWriteStream(path.join(targer, file));
            readable.pipe(writable);
            resolve('写入成功');
        }, 500)
    })
};

inquirer.prompt([
    {
        type: 'input',
        name: 'companyId',
        message: '请输入企业id',
        validate: function (val) {
            if (!val) {
                return "企业id不能为空";
            }
            return true
        }
    },
    {
        type: 'input',
        name: 'appid',
        message: '请输入appid',
        validate: function (val) {
            if (!val) {
                return "appid不能为空";
            }
            return true
        }
    },
    {
        type: 'input',
        name: 'secret',
        message: '请输入secret',
        validate: function (val) {
            if (!val) {
                return "secret不能为空";
            }
            return true
        }
    },
    {
        type: 'confirm',
        name: 'isPathname',
        message: '是否填写域名',
        default: false,
    },
    {
        type: 'input',
        name: 'pathname',
        message: '请输入域名',
        when: res => {
            return res.isPathname
        }
    },

])
    .then(anwsers => {
        // 获取命令行结果
        const {companyId, appid, secret, pathname = 'ysdinghuo.com'} = anwsers;

        if (!companyId || !appid || !secret) {
            return;
        }

        // 在当前 cmd 路径下找到目标文件 yunshl-wx-mall
        const tmplDir = path.join(process.cwd(), 'yunshl-wx-mall');
        //获取模板目录
        const templateFiles = path.join(__dirname, './../yunshl-wx-mall');
        // 在当前 cmd 路劲下创建目标目录，以原文件名加 -companyId 组成
        const filename = `yunshl-wx-mall-${companyId}`;
        // 目标文件路径
        const targetPath = path.join(process.cwd(), `${filename}`);
        //判断文件是否存在，不存在则创建文件，存在则删除文件夹内部文件
        if (!fs.existsSync(targetPath)) {
            try {
                fs.mkdirSync(targetPath, {recursive: true});
            } catch (e) {
                throw e
            }
        } else {
            delDir(targetPath)
        }
        // 临时文件
        const temporaryDir = path.join(__dirname, './../dist');
        //判断文件是否存在，不存在则创建文件，存在则删除文件夹内部文件
        if (!fs.existsSync(temporaryDir)) {
            try {
                fs.mkdirSync(temporaryDir, {recursive: true});
            } catch (e) {
                throw e
            }
        } else {
            delDir(temporaryDir)
        }
        // 复制文件到新文件夹中
        exists(tmplDir, targetPath, copy);
        const promiseArr = [];
        //读取文件模板文件，将结果写入临时文件
        try {
            const files = fs.readdirSync(templateFiles);
            files.forEach(file => {
                ejs.renderFile(path.join(templateFiles, file), {companyId, appid, secret, pathname, filename}, (err, result) => {
                    if (err) throw err;
                    try {
                        fs.writeFileSync(path.join(__dirname, './../dist', file), result);
                        promiseArr.push(streamPromise(file, targetPath, temporaryDir))
                    } catch (e) {
                        console.log(e);
                        throw e
                    }
                })
            });
            Promise.all(promiseArr).then(rs => {
                console.log('操作成功');
                process.exit();
            }).catch(e => {
                console.log('写入错误', e)
            })
        } catch (err) {
            throw err;
        }


    });
