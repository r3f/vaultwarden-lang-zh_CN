"use strict";
/* eslint-env es2017, browser */
/* global _post:readable, BASE_URL:readable */

function smtpTest(event) {
    event.preventDefault();
    event.stopPropagation();
    if (formHasChanges(config_form)) {
        alert("配置已更改但尚未保存。\n请在发送测试邮件之前先保存更改。");
        return false;
    }

    const test_email = document.getElementById("smtp-test-email");

    // 进行非常基本的电子邮件地址检查。
    if (test_email.value.match(/\S+@\S+/i) === null) {
        test_email.parentElement.classList.add("was-validated");
        return false;
    }

    const data = JSON.stringify({ "email": test_email.value });
    _post(`${BASE_URL}/admin/test/smtp`,
        "SMTP 测试邮件已正确发送",
        "发送 SMTP 测试邮件时出错",
        data, false
    );
}

function getFormData() {
    let data = {};

    document.querySelectorAll(".conf-checkbox").forEach(function (e) {
        data[e.name] = e.checked;
    });

    document.querySelectorAll(".conf-number").forEach(function (e) {
        data[e.name] = e.value ? +e.value : null;
    });

    document.querySelectorAll(".conf-text, .conf-password").forEach(function (e) {
        data[e.name] = e.value || null;
    });
    return data;
}

function saveConfig(event) {
    const data = JSON.stringify(getFormData());
    _post(`${BASE_URL}/admin/config`,
        "配置已成功保存",
        "保存配置时出错",
        data
    );
    event.preventDefault();
}

function deleteConf(event) {
    event.preventDefault();
    event.stopPropagation();
    const input = prompt(
        "这将删除所有用户配置，并恢复默认值和环境设置的值。此操作可能危险。请输入 'DELETE' 以继续:"
    );
    if (input === "DELETE") {
        _post(`${BASE_URL}/admin/config/delete`,
            "配置已成功删除",
            "删除配置时出错"
        );
    } else {
        alert("输入错误，请重试");
    }
}

function backupDatabase(event) {
    event.preventDefault();
    event.stopPropagation();
    _post(`${BASE_URL}/admin/config/backup_db`,
        "备份成功创建",
        "创建备份时出错", null, false
    );
}

// 两个函数用于帮助检查表单字段是否有更改
// 例如，在 smtp 测试期间防止用户在测试新设置之前点击保存
function initChangeDetection(form) {
    const ignore_fields = ["smtp-test-email"];
    Array.from(form).forEach((el) => {
        if (!ignore_fields.includes(el.id)) {
            el.dataset.origValue = el.value;
        }
    });
}

function formHasChanges(form) {
    return Array.from(form).some(el => "origValue" in el.dataset && ( el.dataset.origValue !== el.value));
}

// 防止在按回车键时提交表单的功能
function preventFormSubmitOnEnter(form) {
    if (form) {
        form.addEventListener("keypress", (event) => {
            if (event.key == "Enter") {
                event.preventDefault();
            }
        });
    }
}

// 当按回车键时，此函数将钩入 smtp-test-email 输入字段，并在调用 smtpTest() 函数时调用它。
function submitTestEmailOnEnter() {
    const smtp_test_email_input = document.getElementById("smtp-test-email");
    if (smtp_test_email_input) {
        smtp_test_email_input.addEventListener("keypress", (event) => {
            if (event.key == "Enter") {
                event.preventDefault();
                smtpTest(event);
            }
        });
    }
}

// 着色一些高风险的设置
function colorRiskSettings() {
    const risk_items = document.getElementsByClassName("col-form-label");
    Array.from(risk_items).forEach((el) => {
        if (el.textContent.toLowerCase().includes("risks") ) {
            el.parentElement.className += " alert-danger";
        }
    });
}

function toggleVis(event) {
    event.preventDefault();
    event.stopPropagation();

    const elem = document.getElementById(event.target.dataset.vwPwToggle);
    const type = elem.getAttribute("type");
    if (type === "text") {
        elem.setAttribute("type", "password");
    } else {
        elem.setAttribute("type", "text");
    }
}

function masterCheck(check_id, inputs_query) {
    function onChanged(checkbox, inputs_query) {
        return function _fn() {
            document.querySelectorAll(inputs_query).forEach(function (e) { e.disabled = !checkbox.checked; });
            checkbox.disabled = false;
        };
    }

    const checkbox = document.getElementById(check_id);
    if (checkbox) {
        const onChange = onChanged(checkbox, inputs_query);
        onChange(); // 初始化触发事件
        checkbox.addEventListener("change", onChange);
    }
}

// 这将检查 ADMIN_TOKEN 是否不是 Argon2 哈希值。
// 否则，它将显示警告，除非有人已经关闭了它。
// 然后它将在 30 天内不显示此警告。
function checkAdminToken() {
    const admin_token = document.getElementById("input_admin_token");
    const disable_admin_token = document.getElementById("input_disable_admin_token");
    if (!disable_admin_token.checked && !admin_token.value.startsWith("$argon2")) {
        // 检查警告是否已被关闭，并且已经过了 30 天
        const admin_token_warning_closed = localStorage.getItem("admin_token_warning_closed");
        if (admin_token_warning_closed !== null) {
            const closed_date = new Date(parseInt(admin_token_warning_closed));
            const current_date = new Date();
            const thirtyDays = 1000*60*60*24*30;
            if (current_date - closed_date < thirtyDays) {
                return;
            }
        }

        // 在关闭警告时，在浏览器中存储当前日期/时间
        const admin_token_warning = document.getElementById("admin_token_warning");
        admin_token_warning.addEventListener("closed.bs.alert", function() {
            const d = new Date();
            localStorage.setItem("admin_token_warning_closed", d.getTime());
        });

        // 显示警告
        admin_token_warning.classList.remove("d-none");
    }
}

// 检查特定配置值，并在需要时显示警告 div
function showWarnings() {
    checkAdminToken();
}

const config_form = document.getElementById("config-form");

// 在加载时的事件
document.addEventListener("DOMContentLoaded", (/*event*/) => {
    initChangeDetection(config_form);
    // 防止按回车键提交表单并保存配置。
    // 用户需要真正点击保存，这也可以防止意外的提交。
    preventFormSubmitOnEnter(config_form);

    submitTestEmailOnEnter();
    colorRiskSettings();

    document.querySelectorAll("input[id^='input__enable_']").forEach(group_toggle => {
        const input_id = group_toggle.id.replace("input__enable_", "#g_");
        masterCheck(group_toggle.id, `${input_id} input`);
    });

    document.querySelectorAll("button[data-vw-pw-toggle]").forEach(password_toggle_btn => {
        password_toggle_btn.addEventListener("click", toggleVis);
    });

    const btnBackupDatabase = document.getElementById("backupDatabase");
    if (btnBackupDatabase) {
        btnBackupDatabase.addEventListener("click", backupDatabase);
    }
    const btnDeleteConf = document.getElementById("deleteConf");
    if (btnDeleteConf) {
        btnDeleteConf.addEventListener("click", deleteConf);
    }
    const btnSmtpTest = document.getElementById("smtpTest");
    if (btnSmtpTest) {
        btnSmtpTest.addEventListener("click", smtpTest);
    }

    config_form.addEventListener("submit", saveConfig);

    showWarnings();
});
