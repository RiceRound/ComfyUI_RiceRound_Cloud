import { api } from "../../../scripts/api.js";

import { ComfyApp, app } from "../../../scripts/app.js";

import { showToast } from "./riceround.js";

const UserTokenKey = "riceround_user_token";

function isValidJWTFormat(e) {
    if ("string" != typeof e) return !1;
    if (e.length < 50) return !1;
    const t = e.split(".");
    if (3 !== t.length) return !1;
    const o = /^[A-Za-z0-9_-]+$/;
    return t.every((e => e.length > 0 && o.test(e)));
}

async function set_exclusive_user(e) {
    e ? localStorage.setItem("RiceRound.Cloud.exclusive", e) : localStorage.removeItem("RiceRound.Cloud.exclusive");
    200 != (await api.fetchApi("/riceround/set_exclusive_user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            exclusive_user: e
        })
    })).status && showToast("设置专属用户客户ID失败", "error");
}

app.registerExtension({
    name: "riceround.config",
    async setup() {
        app.ui.settings.addSetting({
            id: "RiceRound.User.logout",
            name: "登出当前用户",
            type: () => {
                const e = document.createElement("tr"), t = document.createElement("td"), o = document.createElement("input");
                return o.type = "button", o.value = "登出", o.style.borderRadius = "8px", o.style.padding = "8px 16px", 
                o.style.fontSize = "14px", o.style.cursor = "pointer", o.style.border = "1px solid #666", 
                o.style.backgroundColor = "#444", o.style.color = "#fff", o.onclick = async () => {
                    localStorage.removeItem("Comfy.Settings.RiceRound.User.long_token"), localStorage.removeItem(UserTokenKey), 
                    app.ui.settings.setSettingValue("RiceRound.User.long_token", ""), await api.fetchApi("/riceround/logout"), 
                    showToast("登出成功");
                }, t.appendChild(o), e.appendChild(t), e;
            }
        }), app.ui.settings.addSetting({
            id: "RiceRound.User.long_token",
            name: "设置长效token",
            type: "text",
            textType: "password",
            defaultValue: "",
            tooltip: "用于非本机授权登录情况，请勿泄露！提倡使用本机登录授权更安全！",
            onChange: async function(e) {
                isValidJWTFormat(e) && await api.fetchApi("/riceround/set_long_token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        long_token: e
                    })
                });
            }
        }), app.ui.settings.addSetting({
            id: "RiceRound.Setting.wait-time",
            name: "任务排队等待时间(秒)",
            tooltip: "不建议设置太短，否则可能等不到运行结果就退出了",
            type: "slider",
            attrs: {
                min: 30,
                max: 7200,
                step: 10
            },
            defaultValue: 600,
            onChange: e => {
                api.fetchApi("/riceround/set_wait_time", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        wait_time: e
                    })
                });
            }
        }), app.ui.settings.addSetting({
            id: "RiceRound.Publish",
            name: "自动发布工作流",
            type: "boolean",
            defaultValue: !0,
            tooltip: "设置为true时，会自动发布工作流",
            onChange: function(e) {
                api.fetchApi("/riceround/set_auto_publish", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        auto_publish: e
                    })
                }), e || localStorage.setItem("RiceRound.Setting.auto_overwrite", e);
            }
        }), app.ui.settings.addSetting({
            id: "RiceRound.Publish.auto_overwrite",
            name: "自动覆盖更新同id工作流",
            type: "boolean",
            tooltip: "设置为true时，会自动覆盖已有的template_id的数据",
            onChange: function(e) {
                api.fetchApi("/riceround/set_auto_overwrite", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        auto_overwrite: e
                    })
                });
            }
        }), app.ui.settings.addSetting({
            id: "RiceRound.Cloud.run_client",
            name: "自启动云节点客户端",
            type: "boolean",
            defaultValue: !0,
            tooltip: "没有任何云节点客户运行的话，则该用户云节点无法运行",
            onChange: function(e) {
                api.fetchApi("/riceround/set_run_client", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        run_client: e
                    })
                });
            }
        }), app.ui.settings.addSetting({
            id: "RiceRound.Advanced.setting",
            name: "模型列表存放位置，手动清理或安装高级节点",
            type: () => {
                const e = document.createElement("tr"), t = document.createElement("td"), o = document.createElement("input");
                return o.type = "button", o.value = "打开文件夹", o.style.borderRadius = "8px", o.style.padding = "8px 16px", 
                o.style.fontSize = "14px", o.style.cursor = "pointer", o.style.border = "1px solid #666", 
                o.style.backgroundColor = "#444", o.style.color = "#fff", o.onmouseover = () => {
                    o.style.backgroundColor = "#555";
                }, o.onmouseout = () => {
                    o.style.backgroundColor = "#444";
                }, o.onclick = () => {
                    api.fetchApi("/riceround/open_selector_list_folder", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                }, t.appendChild(o), e.appendChild(t), e;
            }
        });
    }
});