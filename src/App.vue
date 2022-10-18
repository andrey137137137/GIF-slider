<template lang="pug">
#app.slider
  #drop-area(
    ref="dropArea",
    :class="dropAreaModifs",
    @dragenter.prevent.stop="onDragenter",
    @dragover.prevent.stop="onDragover",
    @dragleave.prevent.stop="onDragleave",
    @drop.prevent.stop="onDrop(e)"
  )
    form.my-form
      p Загрузите изображения с помощью диалога выбора файлов или перетащив нужные изображения в выделенную область
      input#fileElem(
        type="file",
        multiple,
        accept="image/*",
        @change="onFiles(files)"
      )
      label.button(for="fileElem") Выбрать изображения
      progress#progress-bar(ref="progressBar", max=100, value=0)
    #gallery
      img(ref="preview")
  .slider-main
  ul.list.slider-frames
    li.list-item.frame.slider-frame(v-for="item in items", :key="item.id")
      a.frame-add_prev(@click.prevent="insertImage(item)", href="#") Insert before {{ item.id }}
      .frame-img(:src="item.id", :alt="'Image ' + item.id")
    li
      a.slider-frame_add_next(@click.prevent="addImage", href="#") Add image
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      isHighlighted: false,
      filesDone: 0,
      filesToDo: 0,
      items: [],
      lastTopID: 0,
    };
  },
  computed: {
    dropAreaModifs() {
      return {
        highlight: this.isHighlighted,
      };
    },
  },
  methods: {
    onDragenter() {
      this.isHighlighted = true;
    },
    onDragover() {
      this.isHighlighted = true;
    },
    onDragleave() {
      this.isHighlighted = false;
    },
    onDrop(e) {
      this.isHighlighted = false;

      const dt = e.dataTransfer;
      const files = dt.files;

      this.onFiles(files);
    },
    onFiles(files) {
      [...files].forEach(this.uploadFile);
      this.initializeProgress(files.length); // <- Добавили эту строку
      files.forEach(this.uploadFile);
      files.forEach(this.previewFile);
    },
    uploadFile(file) {
      const $vm = this;
      const url = "ВАШ URL ДЛЯ ЗАГРУЗКИ ФАЙЛОВ";
      const formData = new FormData();

      formData.append("file", file);

      fetch(url, {
        method: "POST",
        body: formData,
      })
        .then(() => {
          /* Готово. Информируем пользователя */
          $vm.progressDone();
        })
        .catch(() => {
          /* Ошибка. Информируем пользователя */
        });
    },
    previewFile(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = function () {
        this.$refs.preview.src = reader.result;
      };
    },
    initializeProgress(numfiles) {
      this.$refs.progressBar.value = 0;
      this.filesDone = 0;
      this.filesToDo = numfiles;
    },
    progressDone() {
      this.filesDone++;
      this.$refs.progressBar.value = (this.filesDone / this.filesToDo) * 100;
    },
    insertImage(nextImage) {
      const NEXT_ID = nextImage.id;

      if (!isFinite(NEXT_ID)) {
        console.log("infinite");
        return false;
      }

      const NEXT_INDEX = this.items.findIndex((el) => el.id == NEXT_ID);

      if (NEXT_INDEX < 0) {
        console.log("not index");
        return false;
      }

      const OLD_BEFORE_INSERTS_COUNT =
        this.items[NEXT_INDEX].beforeInsertsCount;
      let tempInt = Math.trunc(NEXT_ID);
      let tempFloat = NEXT_ID - tempInt;
      let result = "";

      if (tempFloat == 0) {
        result = tempInt + ".777";
      } else {
        // let counter = 0;
        let tempNumber = tempFloat;
        tempNumber *= 1000;
        console.log(tempNumber);

        // while (tempFloat > 0 && counter < 3) {
        //   tempNumber *= 10;
        //   tempFloat = tempNumber - Math.trunc(tempNumber);
        //   counter++;
        // }

        console.log(tempNumber);
        tempNumber--;
        console.log(tempNumber);
        tempNumber *= 0.001;
        result = (tempInt + tempNumber).toFixed(3);
      }

      this.items[NEXT_INDEX] = {
        id: NEXT_ID,
        beforeInsertsCount: OLD_BEFORE_INSERTS_COUNT + 1,
      };
      // this.items.splice(NEXT_INDEX - 1, 0, { id: result, beforeInsertsCount: 0 });
      this.items.splice(NEXT_INDEX, 0, { id: result, beforeInsertsCount: 0 });
    },
    addImage() {
      this.lastTopID++;
      this.items.push({ id: this.lastTopID + "", beforeInsertsCount: 0 });
    },
  },
};
</script>

<style>
#drop-area {
  border: 2px dashed #ccc;
  border-radius: 20px;
  width: 480px;
  font-family: sans-serif;
  margin: 100px auto;
  padding: 20px;
}
#drop-area.highlight {
  border-color: purple;
}
p {
  margin-top: 0;
}
.my-form {
  margin-bottom: 10px;
}
#gallery {
  margin-top: 10px;
}
#gallery img {
  width: 150px;
  margin-bottom: 10px;
  margin-right: 10px;
  vertical-align: middle;
}
.button {
  display: inline-block;
  padding: 10px;
  background: #ccc;
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.button:hover {
  background: #ddd;
}
#fileElem {
  display: none;
}
</style>
